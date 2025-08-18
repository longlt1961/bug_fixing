#!/usr/bin/env python3
"""
Fix Suggestion Evaluator
Script để đánh giá và so sánh chất lượng gợi ý sửa lỗi giữa RAG và non-RAG
"""

import json
import time
import requests
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv
import subprocess
import tempfile
import shutil

# Load environment variables
load_dotenv()

# Configure Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

class FixSuggestionEvaluator:
    def __init__(self, base_url="http://localhost:8002", sonar_url="http://localhost:9000"):
        self.base_url = base_url
        self.sonar_url = sonar_url
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp') if gemini_api_key else None
        self.results = {
            "fix_suggestions": {
                "without_rag": [],
                "with_rag": []
            },
            "code_quality_metrics": {
                "before_fix": {},
                "after_fix_without_rag": {},
                "after_fix_with_rag": {}
            },
            "comparison_metrics": {},
            "test_metadata": {
                "start_time": None,
                "end_time": None,
                "bugs_tested": 0
            }
        }
    
    def suggest_fix_without_rag(self, bug_data: Dict[str, Any]) -> Dict[str, Any]:
        """Gợi ý fix không sử dụng RAG"""
        if not self.model:
            return {"error": "Gemini API not configured"}
        
        start_time = time.time()
        
        prompt = f"""
Analyze this bug and provide a fix suggestion:

BUG INFORMATION:
- Rule: {bug_data.get('rule_key', 'N/A')}
- Message: {bug_data.get('message', 'N/A')}
- File: {bug_data.get('file_path', 'N/A')}
- Line: {bug_data.get('line', 'N/A')}
- Type: {bug_data.get('type', 'N/A')}
- Severity: {bug_data.get('severity', 'N/A')}
- Code Context: {bug_data.get('code_excerpt', 'N/A')}

Provide a comprehensive fix suggestion including:
1. Root cause analysis
2. Recommended fix approach
3. Code suggestion (if applicable)
4. Potential risks or side effects
5. Testing recommendations
6. Estimated effort (in hours)

Respond in JSON format:
{{
    "root_cause": "detailed analysis of the root cause",
    "fix_approach": "step-by-step approach to fix",
    "code_suggestion": "actual code fix if applicable",
    "risks": "potential risks or side effects",
    "testing_recommendations": "how to test the fix",
    "estimated_effort_hours": 2.5,
    "confidence": 85,
    "fix_quality_score": 8
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
                "fix_suggestion": parsed_response,
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
    
    def suggest_fix_with_rag(self, bug_id: str, bug_data: Dict[str, Any]) -> Dict[str, Any]:
        """Gợi ý fix sử dụng RAG"""
        start_time = time.time()
        
        try:
            # Use RAG API for fix suggestion
            response = requests.post(
                f"{self.base_url}/rag-bugs/suggest-fix",
                json={
                    "bug_id": bug_id,
                    "include_similar_fixes": True
                },
                timeout=60
            )
            
            processing_time = time.time() - start_time
            
            if response.status_code == 200:
                rag_response = response.json()
                
                # Parse AI suggestion to extract structured data
                ai_suggestion = rag_response.get('ai_suggestion', '')
                similar_fixes = rag_response.get('similar_fixes', [])
                
                # Extract structured information from AI suggestion
                structured_fix = self.parse_ai_suggestion(ai_suggestion)
                
                return {
                    "bug_id": bug_id,
                    "fix_suggestion": structured_fix,
                    "ai_suggestion_raw": ai_suggestion,
                    "similar_fixes": similar_fixes,
                    "processing_time": processing_time,
                    "timestamp": datetime.now().isoformat(),
                    "method": "with_rag",
                    "token_estimate": len(ai_suggestion) + 1000  # Estimate for input
                }
            else:
                return {
                    "bug_id": bug_id,
                    "error": f"RAG API error: {response.status_code}",
                    "processing_time": processing_time,
                    "method": "with_rag"
                }
        
        except Exception as e:
            return {
                "bug_id": bug_id,
                "error": str(e),
                "processing_time": time.time() - start_time,
                "method": "with_rag"
            }
    
    def parse_ai_suggestion(self, ai_suggestion: str) -> Dict[str, Any]:
        """Parse AI suggestion text to extract structured information"""
        # Simple parsing logic - in practice, you might want more sophisticated parsing
        lines = ai_suggestion.split('\n')
        
        parsed = {
            "root_cause": "",
            "fix_approach": "",
            "code_suggestion": "",
            "risks": "",
            "testing_recommendations": "",
            "estimated_effort_hours": 2.0,
            "confidence": 80,
            "fix_quality_score": 7
        }
        
        current_section = None
        content = []
        
        for line in lines:
            line = line.strip()
            if 'root cause' in line.lower():
                if current_section and content:
                    parsed[current_section] = '\n'.join(content)
                current_section = 'root_cause'
                content = []
            elif 'fix approach' in line.lower() or 'recommended' in line.lower():
                if current_section and content:
                    parsed[current_section] = '\n'.join(content)
                current_section = 'fix_approach'
                content = []
            elif 'code' in line.lower() and 'suggestion' in line.lower():
                if current_section and content:
                    parsed[current_section] = '\n'.join(content)
                current_section = 'code_suggestion'
                content = []
            elif 'risk' in line.lower():
                if current_section and content:
                    parsed[current_section] = '\n'.join(content)
                current_section = 'risks'
                content = []
            elif 'test' in line.lower():
                if current_section and content:
                    parsed[current_section] = '\n'.join(content)
                current_section = 'testing_recommendations'
                content = []
            elif line and not line.startswith('#'):
                content.append(line)
        
        # Add the last section
        if current_section and content:
            parsed[current_section] = '\n'.join(content)
        
        return parsed
    
    def import_bug_to_rag(self, bug_data: Dict[str, Any]) -> Optional[str]:
        """Import bug to RAG system and return bug_id"""
        try:
            # Convert SonarQube issue to RAG bug format
            rag_bug = {
                "name": f"{bug_data.get('rule_key', 'Unknown')}: {bug_data.get('message', 'No message')[:100]}",
                "description": bug_data.get('message', 'No description'),
                "type": bug_data.get('type', 'BUG'),
                "severity": bug_data.get('severity', 'MEDIUM'),
                "status": "OPEN",
                "file_path": bug_data.get('file_path', ''),
                "line_number": bug_data.get('line', 0),
                "code_snippet": bug_data.get('code_excerpt', ''),
                "labels": [bug_data.get('rule_key', ''), bug_data.get('type', '')],
                "project": "test-project",
                "component": bug_data.get('component', 'Unknown'),
                "metadata": {
                    "sonar_rule": bug_data.get('rule_key', ''),
                    "original_severity": bug_data.get('severity', ''),
                    "imported_for_testing": True
                }
            }
            
            # Import to RAG
            response = requests.post(
                f"{self.base_url}/rag-bugs/import",
                json={
                    "bugs": [rag_bug],
                    "collection_name": "bug_rag_documents",
                    "generate_embeddings": True
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                imported_bugs = result.get('imported_bugs', [])
                if imported_bugs:
                    return imported_bugs[0]['bug_id']
            
            return None
        
        except Exception as e:
            print(f"Error importing bug to RAG: {e}")
            return None
    
    def evaluate_fix_suggestions(self, test_bugs: List[Dict[str, Any]], max_bugs: int = 10):
        """Đánh giá fix suggestions cho list bugs"""
        print("🔧 Starting Fix Suggestion Evaluation...")
        self.results["test_metadata"]["start_time"] = datetime.now().isoformat()
        
        # Limit test bugs
        test_bugs = test_bugs[:max_bugs]
        self.results["test_metadata"]["bugs_tested"] = len(test_bugs)
        
        print(f"📊 Testing fix suggestions for {len(test_bugs)} bugs...")
        
        for i, bug in enumerate(test_bugs, 1):
            print(f"\n🐛 Processing bug {i}/{len(test_bugs)}: {bug.get('rule_key', 'unknown')}")
            
            # 1. Get fix suggestion without RAG
            print("  📝 Getting fix suggestion without RAG...")
            fix_without_rag = self.suggest_fix_without_rag(bug)
            self.results["fix_suggestions"]["without_rag"].append(fix_without_rag)
            
            # 2. Import bug to RAG and get fix suggestion with RAG
            print("  🧠 Importing to RAG and getting fix suggestion...")
            bug_id = self.import_bug_to_rag(bug)
            
            if bug_id:
                time.sleep(2)  # Wait for embedding generation
                fix_with_rag = self.suggest_fix_with_rag(bug_id, bug)
                self.results["fix_suggestions"]["with_rag"].append(fix_with_rag)
            else:
                print("    ❌ Failed to import bug to RAG")
                self.results["fix_suggestions"]["with_rag"].append({
                    "bug_id": "failed_import",
                    "error": "Failed to import to RAG",
                    "method": "with_rag"
                })
            
            time.sleep(1)  # Rate limiting
        
        # Calculate comparison metrics
        print("\n📈 Calculating comparison metrics...")
        self.calculate_fix_comparison_metrics()
        
        # Generate report
        print("\n📄 Generating fix evaluation report...")
        report_file = self.generate_fix_report()
        
        self.results["test_metadata"]["end_time"] = datetime.now().isoformat()
        
        print(f"\n✅ Fix evaluation completed! Report saved to: {report_file}")
        return self.results
    
    def calculate_fix_comparison_metrics(self):
        """Tính toán metrics so sánh fix suggestions"""
        without_rag_fixes = [f for f in self.results["fix_suggestions"]["without_rag"] if 'error' not in f]
        with_rag_fixes = [f for f in self.results["fix_suggestions"]["with_rag"] if 'error' not in f]
        
        # Token usage
        without_rag_tokens = sum([f.get('token_estimate', 0) for f in without_rag_fixes])
        with_rag_tokens = sum([f.get('token_estimate', 0) for f in with_rag_fixes])
        
        # Processing time
        without_rag_time = sum([f.get('processing_time', 0) for f in without_rag_fixes])
        with_rag_time = sum([f.get('processing_time', 0) for f in with_rag_fixes])
        
        # Confidence scores
        without_rag_confidence = [f.get('fix_suggestion', {}).get('confidence', 0) for f in without_rag_fixes]
        with_rag_confidence = [f.get('fix_suggestion', {}).get('confidence', 0) for f in with_rag_fixes]
        
        # Fix quality scores
        without_rag_quality = [f.get('fix_suggestion', {}).get('fix_quality_score', 0) for f in without_rag_fixes]
        with_rag_quality = [f.get('fix_suggestion', {}).get('fix_quality_score', 0) for f in with_rag_fixes]
        
        # Estimated effort
        without_rag_effort = [f.get('fix_suggestion', {}).get('estimated_effort_hours', 0) for f in without_rag_fixes]
        with_rag_effort = [f.get('fix_suggestion', {}).get('estimated_effort_hours', 0) for f in with_rag_fixes]
        
        # Similar fixes usage (only for RAG)
        similar_fixes_used = [len(f.get('similar_fixes', [])) for f in with_rag_fixes]
        
        self.results["comparison_metrics"] = {
            "token_usage": {
                "without_rag": without_rag_tokens,
                "with_rag": with_rag_tokens,
                "difference": with_rag_tokens - without_rag_tokens,
                "percentage_increase": ((with_rag_tokens - without_rag_tokens) / without_rag_tokens * 100) if without_rag_tokens > 0 else 0
            },
            "processing_time": {
                "without_rag_avg": without_rag_time / len(without_rag_fixes) if without_rag_fixes else 0,
                "with_rag_avg": with_rag_time / len(with_rag_fixes) if with_rag_fixes else 0
            },
            "confidence_scores": {
                "without_rag_avg": sum(without_rag_confidence) / len(without_rag_confidence) if without_rag_confidence else 0,
                "with_rag_avg": sum(with_rag_confidence) / len(with_rag_confidence) if with_rag_confidence else 0
            },
            "fix_quality_scores": {
                "without_rag_avg": sum(without_rag_quality) / len(without_rag_quality) if without_rag_quality else 0,
                "with_rag_avg": sum(with_rag_quality) / len(with_rag_quality) if with_rag_quality else 0
            },
            "estimated_effort": {
                "without_rag_avg": sum(without_rag_effort) / len(without_rag_effort) if without_rag_effort else 0,
                "with_rag_avg": sum(with_rag_effort) / len(with_rag_effort) if with_rag_effort else 0
            },
            "rag_specific": {
                "avg_similar_fixes_used": sum(similar_fixes_used) / len(similar_fixes_used) if similar_fixes_used else 0,
                "fixes_with_similar_context": len([f for f in similar_fixes_used if f > 0])
            },
            "success_rates": {
                "without_rag": len(without_rag_fixes) / len(self.results["fix_suggestions"]["without_rag"]) if self.results["fix_suggestions"]["without_rag"] else 0,
                "with_rag": len(with_rag_fixes) / len(self.results["fix_suggestions"]["with_rag"]) if self.results["fix_suggestions"]["with_rag"] else 0
            }
        }
    
    def generate_fix_report(self) -> str:
        """Tạo báo cáo đánh giá fix suggestions"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f'fix_suggestion_evaluation_{timestamp}.json'
        
        report = {
            "evaluation_metadata": {
                "evaluation_date": datetime.now().isoformat(),
                "bugs_tested": self.results["test_metadata"]["bugs_tested"],
                "gemini_model": "gemini-2.0-flash-exp",
                "rag_base_url": self.base_url
            },
            "comparison_metrics": self.results["comparison_metrics"],
            "detailed_results": self.results["fix_suggestions"],
            "test_metadata": self.results["test_metadata"]
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report_file
    
    def run_code_quality_comparison(self, source_dir: str, fixes_without_rag: List[str], fixes_with_rag: List[str]):
        """Chạy so sánh chất lượng code sau khi apply fixes"""
        print("🔍 Running code quality comparison...")
        
        # This is a placeholder for actual code quality measurement
        # In practice, you would:
        # 1. Apply fixes to separate copies of the source code
        # 2. Run SonarQube scan on each version
        # 3. Compare the results
        
        # For now, we'll simulate the process
        self.results["code_quality_metrics"] = {
            "before_fix": {
                "total_issues": 50,
                "critical_issues": 5,
                "major_issues": 15,
                "minor_issues": 30,
                "code_coverage": 65.5,
                "maintainability_index": 72.3
            },
            "after_fix_without_rag": {
                "total_issues": 35,
                "critical_issues": 3,
                "major_issues": 10,
                "minor_issues": 22,
                "code_coverage": 68.2,
                "maintainability_index": 75.1,
                "issues_fixed": 15,
                "new_issues_introduced": 0
            },
            "after_fix_with_rag": {
                "total_issues": 28,
                "critical_issues": 1,
                "major_issues": 7,
                "minor_issues": 20,
                "code_coverage": 71.8,
                "maintainability_index": 78.9,
                "issues_fixed": 22,
                "new_issues_introduced": 0
            }
        }
        
        print("✅ Code quality comparison completed (simulated)")

def main():
    """Main function để chạy fix suggestion evaluation"""
    print("🔧 Fix Suggestion Evaluator - Automated Testing")
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
    
    # Filter for bugs that are likely to need fixes (not just code smells)
    fixable_issues = [
        issue for issue in issues 
        if issue.get('type') in ['BUG', 'VULNERABILITY'] 
        and issue.get('severity') in ['MAJOR', 'CRITICAL', 'BLOCKER']
    ]
    
    print(f"🎯 Found {len(fixable_issues)} fixable issues (BUG/VULNERABILITY with MAJOR+ severity)")
    
    if not fixable_issues:
        print("⚠️ No fixable issues found. Using all issues for testing.")
        fixable_issues = issues[:10]  # Use first 10 issues
    
    # Initialize evaluator
    evaluator = FixSuggestionEvaluator()
    
    # Run fix suggestion evaluation
    max_bugs = min(5, len(fixable_issues))  # Limit to 5 bugs for testing
    results = evaluator.evaluate_fix_suggestions(fixable_issues, max_bugs)
    
    # Print summary
    print("\n📊 FIX SUGGESTION EVALUATION SUMMARY")
    print("=" * 40)
    
    metrics = results.get('comparison_metrics', {})
    
    if 'token_usage' in metrics:
        token_metrics = metrics['token_usage']
        print(f"💰 Token Usage:")
        print(f"  Without RAG: {token_metrics['without_rag']:,} tokens")
        print(f"  With RAG: {token_metrics['with_rag']:,} tokens")
        print(f"  Increase: {token_metrics['percentage_increase']:.1f}%")
    
    if 'confidence_scores' in metrics:
        conf_metrics = metrics['confidence_scores']
        print(f"\n🎯 Confidence Scores:")
        print(f"  Without RAG: {conf_metrics['without_rag_avg']:.1f}%")
        print(f"  With RAG: {conf_metrics['with_rag_avg']:.1f}%")
    
    if 'fix_quality_scores' in metrics:
        quality_metrics = metrics['fix_quality_scores']
        print(f"\n⭐ Fix Quality Scores (1-10):")
        print(f"  Without RAG: {quality_metrics['without_rag_avg']:.1f}")
        print(f"  With RAG: {quality_metrics['with_rag_avg']:.1f}")
    
    if 'rag_specific' in metrics:
        rag_metrics = metrics['rag_specific']
        print(f"\n🧠 RAG-Specific Metrics:")
        print(f"  Average similar fixes used: {rag_metrics['avg_similar_fixes_used']:.1f}")
        print(f"  Fixes with similar context: {rag_metrics['fixes_with_similar_context']}")
    
    print("\n✅ Fix suggestion evaluation completed successfully!")

if __name__ == "__main__":
    main()