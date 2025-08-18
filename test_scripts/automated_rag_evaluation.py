#!/usr/bin/env python3
"""
Automated RAG Evaluation Suite
Script tự động để đánh giá hiệu quả của RAG trong việc quét và sửa lỗi
"""

import json
import time
import requests
import os
from datetime import datetime
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report

# Load environment variables
load_dotenv()

# Configure Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

class RAGEvaluationSuite:
    def __init__(self, base_url="http://localhost:8002"):
        self.base_url = base_url
        self.results = {
            "without_rag": [],
            "with_rag": [],
            "metrics": {},
            "ground_truth": [],
            "test_metadata": {
                "start_time": None,
                "end_time": None,
                "total_issues_tested": 0
            }
        }
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp') if gemini_api_key else None
    
    def load_ground_truth(self, ground_truth_file: str):
        """Load ground truth labels for evaluation"""
        try:
            with open(ground_truth_file, 'r', encoding='utf-8') as f:
                self.ground_truth = json.load(f)
            print(f"✅ Loaded {len(self.ground_truth)} ground truth labels")
        except FileNotFoundError:
            print("⚠️ Ground truth file not found. Creating template...")
            self.create_ground_truth_template()
    
    def create_ground_truth_template(self):
        """Create template for ground truth labels"""
        template = {
            "instructions": "Label each bug as: true_bug, false_positive, or uncertain",
            "labels": [
                {
                    "bug_id": "example_id",
                    "rule_key": "java:S1234",
                    "message": "Example bug message",
                    "label": "true_bug",  # true_bug, false_positive, uncertain
                    "severity_ground_truth": "HIGH",  # LOW, MEDIUM, HIGH, CRITICAL
                    "notes": "Explanation for the label"
                }
            ]
        }
        
        with open('ground_truth_template.json', 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2, ensure_ascii=False)
        
        print("📝 Created ground_truth_template.json - Please fill it with actual labels")
    
    def evaluate_bug_without_rag(self, bug_data: Dict[str, Any]) -> Dict[str, Any]:
        """Đánh giá bug không sử dụng RAG"""
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        start_time = time.time()
        
        prompt = f"""
Analyze this bug report and determine:
1. Is this a real bug or false positive?
2. Severity level (LOW/MEDIUM/HIGH/CRITICAL)
3. Confidence score (0-100%)
4. Brief reasoning

Bug Information:
- Rule: {bug_data.get('rule_key', 'N/A')}
- Message: {bug_data.get('message', 'N/A')}
- File: {bug_data.get('file_path', 'N/A')}
- Line: {bug_data.get('line', 'N/A')}
- Type: {bug_data.get('type', 'N/A')}
- Severity: {bug_data.get('severity', 'N/A')}

Respond in JSON format:
{{
    "is_real_bug": true/false,
    "severity": "HIGH",
    "confidence": 85,
    "reasoning": "brief explanation"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            processing_time = time.time() - start_time
            
            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            parsed_response = json.loads(response_text)
            
            return {
                "bug_id": bug_data.get('bug_id', 'unknown'),
                "response": parsed_response,
                "processing_time": processing_time,
                "timestamp": datetime.now().isoformat(),
                "method": "without_rag",
                "token_estimate": len(prompt) + len(response.text)
            }
        
        except Exception as e:
            return {
                "bug_id": bug_data.get('bug_id', 'unknown'),
                "error": str(e),
                "processing_time": time.time() - start_time,
                "method": "without_rag"
            }
    
    def evaluate_bug_with_rag(self, bug_data: Dict[str, Any]) -> Dict[str, Any]:
        """Đánh giá bug sử dụng RAG"""
        start_time = time.time()
        
        try:
            # 1. Search similar bugs in RAG
            search_query = f"{bug_data.get('message', '')} {bug_data.get('rule_key', '')}"
            search_response = requests.post(
                f"{self.base_url}/rag-bugs/search",
                json={
                    "query": search_query,
                    "top_k": 3,
                    "filters": {"bug_type": bug_data.get('type', 'BUG')}
                },
                timeout=30
            )
            
            similar_bugs = []
            if search_response.status_code == 200:
                similar_bugs = search_response.json().get('results', [])
            
            # 2. Generate evaluation with RAG context
            rag_context = "\n".join([
                f"Similar Bug {i+1}: {bug.get('metadata', {}).get('bug_name', 'Unknown')} - {bug.get('content', '')[:200]}..."
                for i, bug in enumerate(similar_bugs)
            ])
            
            if not self.model:
                return {"error": "Gemini API not configured"}
            
            prompt = f"""
Analyze this bug report using context from similar bugs in our knowledge base:

CURRENT BUG:
- Rule: {bug_data.get('rule_key', 'N/A')}
- Message: {bug_data.get('message', 'N/A')}
- File: {bug_data.get('file_path', 'N/A')}
- Line: {bug_data.get('line', 'N/A')}
- Type: {bug_data.get('type', 'N/A')}
- Severity: {bug_data.get('severity', 'N/A')}

SIMILAR BUGS CONTEXT:
{rag_context if rag_context else 'No similar bugs found'}

Based on the similar bugs and your analysis, determine:
1. Is this a real bug or false positive?
2. Severity level (LOW/MEDIUM/HIGH/CRITICAL)
3. Confidence score (0-100%)
4. Brief reasoning with reference to similar cases

Respond in JSON format:
{{
    "is_real_bug": true/false,
    "severity": "HIGH",
    "confidence": 85,
    "reasoning": "explanation with reference to similar bugs",
    "similar_bugs_used": {len(similar_bugs)}
}}
"""
            
            response = self.model.generate_content(prompt)
            processing_time = time.time() - start_time
            
            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            parsed_response = json.loads(response_text)
            
            return {
                "bug_id": bug_data.get('bug_id', 'unknown'),
                "response": parsed_response,
                "similar_bugs": similar_bugs,
                "processing_time": processing_time,
                "timestamp": datetime.now().isoformat(),
                "method": "with_rag",
                "token_estimate": len(prompt) + len(response.text)
            }
        
        except Exception as e:
            return {
                "bug_id": bug_data.get('bug_id', 'unknown'),
                "error": str(e),
                "processing_time": time.time() - start_time,
                "method": "with_rag"
            }
    
    def run_full_evaluation(self, test_issues: List[Dict[str, Any]], max_issues: int = 20):
        """Chạy đánh giá đầy đủ"""
        print("🚀 Starting RAG Evaluation Suite...")
        self.results["test_metadata"]["start_time"] = datetime.now().isoformat()
        
        # Limit test issues
        test_issues = test_issues[:max_issues]
        self.results["test_metadata"]["total_issues_tested"] = len(test_issues)
        
        print(f"📊 Testing {len(test_issues)} issues...")
        
        # 1. Test without RAG
        print("\n🔍 Testing without RAG...")
        for i, issue in enumerate(test_issues, 1):
            print(f"  Processing issue {i}/{len(test_issues)}: {issue.get('rule_key', 'unknown')}")
            result = self.evaluate_bug_without_rag(issue)
            self.results["without_rag"].append(result)
            time.sleep(1)  # Rate limiting
        
        # 2. Test with RAG
        print("\n🧠 Testing with RAG...")
        for i, issue in enumerate(test_issues, 1):
            print(f"  Processing issue {i}/{len(test_issues)}: {issue.get('rule_key', 'unknown')}")
            result = self.evaluate_bug_with_rag(issue)
            self.results["with_rag"].append(result)
            time.sleep(1)  # Rate limiting
        
        # 3. Calculate metrics
        print("\n📈 Calculating comparison metrics...")
        self.calculate_comparison_metrics()
        
        # 4. Generate report
        print("\n📄 Generating report...")
        report_file = self.generate_report()
        
        self.results["test_metadata"]["end_time"] = datetime.now().isoformat()
        
        print(f"\n✅ Evaluation completed! Report saved to: {report_file}")
        return self.results
    
    def calculate_comparison_metrics(self):
        """Tính toán metrics so sánh"""
        # Token usage comparison
        without_rag_tokens = sum([r.get('token_estimate', 0) for r in self.results["without_rag"] if 'error' not in r])
        with_rag_tokens = sum([r.get('token_estimate', 0) for r in self.results["with_rag"] if 'error' not in r])
        
        # Processing time comparison
        without_rag_time = sum([r.get('processing_time', 0) for r in self.results["without_rag"] if 'error' not in r])
        with_rag_time = sum([r.get('processing_time', 0) for r in self.results["with_rag"] if 'error' not in r])
        
        # Confidence comparison
        without_rag_confidence = [r.get('response', {}).get('confidence', 0) for r in self.results["without_rag"] if 'error' not in r]
        with_rag_confidence = [r.get('response', {}).get('confidence', 0) for r in self.results["with_rag"] if 'error' not in r]
        
        # Error rates
        without_rag_errors = len([r for r in self.results["without_rag"] if 'error' in r])
        with_rag_errors = len([r for r in self.results["with_rag"] if 'error' in r])
        
        self.results["metrics"] = {
            "token_usage": {
                "without_rag": without_rag_tokens,
                "with_rag": with_rag_tokens,
                "difference": with_rag_tokens - without_rag_tokens,
                "percentage_increase": ((with_rag_tokens - without_rag_tokens) / without_rag_tokens * 100) if without_rag_tokens > 0 else 0
            },
            "processing_time": {
                "without_rag_total": without_rag_time,
                "with_rag_total": with_rag_time,
                "without_rag_avg": without_rag_time / len(self.results["without_rag"]) if self.results["without_rag"] else 0,
                "with_rag_avg": with_rag_time / len(self.results["with_rag"]) if self.results["with_rag"] else 0
            },
            "confidence": {
                "without_rag_avg": sum(without_rag_confidence) / len(without_rag_confidence) if without_rag_confidence else 0,
                "with_rag_avg": sum(with_rag_confidence) / len(with_rag_confidence) if with_rag_confidence else 0,
                "without_rag_std": np.std(without_rag_confidence) if without_rag_confidence else 0,
                "with_rag_std": np.std(with_rag_confidence) if with_rag_confidence else 0
            },
            "error_rates": {
                "without_rag_errors": without_rag_errors,
                "with_rag_errors": with_rag_errors,
                "without_rag_success_rate": (len(self.results["without_rag"]) - without_rag_errors) / len(self.results["without_rag"]) if self.results["without_rag"] else 0,
                "with_rag_success_rate": (len(self.results["with_rag"]) - with_rag_errors) / len(self.results["with_rag"]) if self.results["with_rag"] else 0
            }
        }
        
        # Calculate accuracy if ground truth is available
        if self.ground_truth:
            self.calculate_accuracy_metrics()
    
    def calculate_accuracy_metrics(self):
        """Tính toán accuracy metrics với ground truth"""
        ground_truth_dict = {item['bug_id']: item for item in self.ground_truth.get('labels', [])}
        
        # Prepare data for confusion matrix
        y_true = []
        y_pred_without_rag = []
        y_pred_with_rag = []
        
        for result_without, result_with in zip(self.results["without_rag"], self.results["with_rag"]):
            bug_id = result_without.get('bug_id')
            if bug_id in ground_truth_dict and 'error' not in result_without and 'error' not in result_with:
                ground_truth_label = ground_truth_dict[bug_id]['label']
                
                # Convert to binary classification (true_bug vs false_positive)
                if ground_truth_label == 'true_bug':
                    y_true.append(1)
                elif ground_truth_label == 'false_positive':
                    y_true.append(0)
                else:  # uncertain cases - skip
                    continue
                
                # Get predictions
                without_rag_pred = 1 if result_without.get('response', {}).get('is_real_bug', False) else 0
                with_rag_pred = 1 if result_with.get('response', {}).get('is_real_bug', False) else 0
                
                y_pred_without_rag.append(without_rag_pred)
                y_pred_with_rag.append(with_rag_pred)
        
        if y_true:
            # Calculate confusion matrices
            cm_without_rag = confusion_matrix(y_true, y_pred_without_rag)
            cm_with_rag = confusion_matrix(y_true, y_pred_with_rag)
            
            # Calculate classification reports
            report_without_rag = classification_report(y_true, y_pred_without_rag, output_dict=True)
            report_with_rag = classification_report(y_true, y_pred_with_rag, output_dict=True)
            
            self.results["metrics"]["accuracy"] = {
                "confusion_matrix": {
                    "without_rag": cm_without_rag.tolist(),
                    "with_rag": cm_with_rag.tolist()
                },
                "classification_report": {
                    "without_rag": report_without_rag,
                    "with_rag": report_with_rag
                },
                "samples_evaluated": len(y_true)
            }
    
    def generate_report(self) -> str:
        """Tạo báo cáo so sánh"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f'rag_evaluation_report_{timestamp}.json'
        
        report = {
            "evaluation_metadata": {
                "evaluation_date": datetime.now().isoformat(),
                "test_cases": len(self.results["without_rag"]),
                "gemini_model": "gemini-2.0-flash-exp",
                "rag_base_url": self.base_url
            },
            "summary_metrics": self.results["metrics"],
            "detailed_results": {
                "without_rag": self.results["without_rag"],
                "with_rag": self.results["with_rag"]
            },
            "test_metadata": self.results["test_metadata"]
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Also generate a summary CSV
        self.generate_summary_csv(timestamp)
        
        return report_file
    
    def generate_summary_csv(self, timestamp: str):
        """Tạo file CSV tóm tắt kết quả"""
        csv_file = f'rag_evaluation_summary_{timestamp}.csv'
        
        summary_data = []
        
        for result_without, result_with in zip(self.results["without_rag"], self.results["with_rag"]):
            if 'error' not in result_without and 'error' not in result_with:
                summary_data.append({
                    'bug_id': result_without.get('bug_id'),
                    'without_rag_is_real_bug': result_without.get('response', {}).get('is_real_bug'),
                    'without_rag_confidence': result_without.get('response', {}).get('confidence'),
                    'without_rag_severity': result_without.get('response', {}).get('severity'),
                    'without_rag_processing_time': result_without.get('processing_time'),
                    'with_rag_is_real_bug': result_with.get('response', {}).get('is_real_bug'),
                    'with_rag_confidence': result_with.get('response', {}).get('confidence'),
                    'with_rag_severity': result_with.get('response', {}).get('severity'),
                    'with_rag_processing_time': result_with.get('processing_time'),
                    'similar_bugs_found': result_with.get('response', {}).get('similar_bugs_used', 0)
                })
        
        df = pd.DataFrame(summary_data)
        df.to_csv(csv_file, index=False)
        print(f"📊 Summary CSV saved to: {csv_file}")

def main():
    """Main function để chạy evaluation"""
    print("🔧 RAG Evaluation Suite - Automated Testing")
    print("=" * 50)
    
    # Check if SonarQube issues file exists
    issues_file = 'issues_my-service.json'
    if not os.path.exists(issues_file):
        print(f"❌ Issues file not found: {issues_file}")
        print("Please run SonarQube scan and export issues first.")
        return
    
    # Load test issues
    with open(issues_file, 'r', encoding='utf-8') as f:
        issues_data = json.load(f)
    
    issues = issues_data.get('issues', [])
    print(f"📁 Loaded {len(issues)} issues from {issues_file}")
    
    if not issues:
        print("❌ No issues found in the file")
        return
    
    # Initialize evaluator
    evaluator = RAGEvaluationSuite()
    
    # Load ground truth if available
    if os.path.exists('ground_truth.json'):
        evaluator.load_ground_truth('ground_truth.json')
    
    # Run evaluation
    max_issues = min(20, len(issues))  # Limit to 20 issues for testing
    results = evaluator.run_full_evaluation(issues, max_issues)
    
    # Print summary
    print("\n📊 EVALUATION SUMMARY")
    print("=" * 30)
    
    metrics = results.get('metrics', {})
    
    if 'token_usage' in metrics:
        token_metrics = metrics['token_usage']
        print(f"💰 Token Usage:")
        print(f"  Without RAG: {token_metrics['without_rag']:,} tokens")
        print(f"  With RAG: {token_metrics['with_rag']:,} tokens")
        print(f"  Increase: {token_metrics['percentage_increase']:.1f}%")
    
    if 'confidence' in metrics:
        conf_metrics = metrics['confidence']
        print(f"\n🎯 Confidence Scores:")
        print(f"  Without RAG: {conf_metrics['without_rag_avg']:.1f}% (±{conf_metrics['without_rag_std']:.1f})")
        print(f"  With RAG: {conf_metrics['with_rag_avg']:.1f}% (±{conf_metrics['with_rag_std']:.1f})")
    
    if 'accuracy' in metrics:
        acc_metrics = metrics['accuracy']
        print(f"\n📈 Accuracy Metrics (based on {acc_metrics['samples_evaluated']} samples):")
        
        without_rag_f1 = acc_metrics['classification_report']['without_rag']['weighted avg']['f1-score']
        with_rag_f1 = acc_metrics['classification_report']['with_rag']['weighted avg']['f1-score']
        
        print(f"  Without RAG F1-Score: {without_rag_f1:.3f}")
        print(f"  With RAG F1-Score: {with_rag_f1:.3f}")
        print(f"  F1-Score Improvement: {((with_rag_f1 - without_rag_f1) / without_rag_f1 * 100):.1f}%")
    
    print("\n✅ Evaluation completed successfully!")

if __name__ == "__main__":
    main()