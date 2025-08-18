#!/usr/bin/env python3
"""
Comprehensive RAG Evaluation
Script tổng hợp để chạy toàn bộ quy trình đánh giá hiệu quả RAG
"""

import json
import os
import time
import subprocess
from datetime import datetime
from typing import Dict, List, Any
import argparse
from pathlib import Path

# Import our evaluation modules
from automated_rag_evaluation import RAGEvaluator
from fix_suggestion_evaluator import FixSuggestionEvaluator
from code_quality_analyzer import CodeQualityAnalyzer

class ComprehensiveRAGEvaluation:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.results = {
            "evaluation_metadata": {
                "start_time": None,
                "end_time": None,
                "config": config
            },
            "phase_results": {
                "bug_detection": None,
                "fix_suggestions": None,
                "code_quality": None
            },
            "final_comparison": {},
            "recommendations": []
        }
    
    def setup_environment(self) -> bool:
        """Thiết lập môi trường test"""
        print("🔧 Setting up evaluation environment...")
        
        # Check if required services are running
        services_status = self.check_services()
        
        if not all(services_status.values()):
            print("❌ Some required services are not running:")
            for service, status in services_status.items():
                status_icon = "✅" if status else "❌"
                print(f"  {status_icon} {service}")
            return False
        
        print("✅ All required services are running")
        return True
    
    def check_services(self) -> Dict[str, bool]:
        """Kiểm tra trạng thái các services cần thiết"""
        services = {
            "MongoDB": self.check_mongodb(),
            "FixChain RAG API": self.check_fixchain_api(),
            "SonarQube": self.check_sonarqube()
        }
        return services
    
    def check_mongodb(self) -> bool:
        """Kiểm tra MongoDB"""
        try:
            import pymongo
            client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
            client.server_info()
            return True
        except Exception:
            return False
    
    def check_fixchain_api(self) -> bool:
        """Kiểm tra FixChain API"""
        try:
            import requests
            response = requests.get(f"{self.config['fixchain_url']}/health", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def check_sonarqube(self) -> bool:
        """Kiểm tra SonarQube"""
        try:
            import requests
            response = requests.get(f"{self.config['sonar_url']}/api/system/status", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def run_sonar_scan_and_export(self, project_path: str) -> str:
        """Chạy SonarQube scan và export issues"""
        print("🔍 Running SonarQube scan...")
        
        try:
            # Change to project directory
            original_cwd = os.getcwd()
            os.chdir(project_path)
            
            # Run sonar scanner
            project_key = self.config.get('sonar_project_key', 'test-project')
            cmd = [
                'sonar-scanner',
                f'-Dsonar.projectKey={project_key}',
                f'-Dsonar.sources=.',
                f'-Dsonar.host.url={self.config["sonar_url"]}'
            ]
            
            if self.config.get('sonar_token'):
                cmd.append(f'-Dsonar.login={self.config["sonar_token"]}')
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Change back to original directory
            os.chdir(original_cwd)
            
            if result.returncode == 0:
                print("✅ SonarQube scan completed")
                
                # Wait for analysis to complete
                time.sleep(10)
                
                # Export issues
                issues_file = self.export_sonar_issues(project_key)
                return issues_file
            else:
                print(f"❌ SonarQube scan failed: {result.stderr}")
                return None
        
        except Exception as e:
            print(f"❌ Error running SonarQube scan: {e}")
            return None
        finally:
            os.chdir(original_cwd)
    
    def export_sonar_issues(self, project_key: str) -> str:
        """Export SonarQube issues to JSON file"""
        try:
            import requests
            
            url = f"{self.config['sonar_url']}/api/issues/search"
            params = {
                'componentKeys': project_key,
                'ps': 500  # Page size
            }
            
            headers = {}
            if self.config.get('sonar_token'):
                headers['Authorization'] = f'Bearer {self.config["sonar_token"]}'
            
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                issues_data = response.json()
                
                # Save to file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                issues_file = f'issues_{project_key}_{timestamp}.json'
                
                with open(issues_file, 'w', encoding='utf-8') as f:
                    json.dump(issues_data, f, indent=2, ensure_ascii=False)
                
                print(f"✅ Issues exported to: {issues_file}")
                return issues_file
            else:
                print(f"❌ Failed to export issues: {response.status_code}")
                return None
        
        except Exception as e:
            print(f"❌ Error exporting issues: {e}")
            return None
    
    def phase1_bug_detection_evaluation(self, issues_file: str) -> Dict[str, Any]:
        """Phase 1: Đánh giá khả năng phát hiện bug"""
        print("\n" + "=" * 60)
        print("📊 PHASE 1: BUG DETECTION EVALUATION")
        print("=" * 60)
        
        evaluator = RAGEvaluator(
            base_url=self.config['fixchain_url'],
            gemini_api_key=self.config.get('gemini_api_key')
        )
        
        # Load issues
        with open(issues_file, 'r', encoding='utf-8') as f:
            issues_data = json.load(f)
        
        issues = issues_data.get('issues', [])
        
        # Run evaluation
        results = evaluator.evaluate_rag_effectiveness(
            issues, 
            max_bugs=self.config.get('max_bugs_to_test', 10)
        )
        
        return results
    
    def phase2_fix_suggestion_evaluation(self, issues_file: str) -> Dict[str, Any]:
        """Phase 2: Đánh giá chất lượng gợi ý sửa lỗi"""
        print("\n" + "=" * 60)
        print("🔧 PHASE 2: FIX SUGGESTION EVALUATION")
        print("=" * 60)
        
        evaluator = FixSuggestionEvaluator(
            base_url=self.config['fixchain_url'],
            sonar_url=self.config['sonar_url']
        )
        
        # Load issues
        with open(issues_file, 'r', encoding='utf-8') as f:
            issues_data = json.load(f)
        
        issues = issues_data.get('issues', [])
        
        # Filter for fixable issues
        fixable_issues = [
            issue for issue in issues 
            if issue.get('type') in ['BUG', 'VULNERABILITY'] 
            and issue.get('severity') in ['MAJOR', 'CRITICAL', 'BLOCKER']
        ]
        
        if not fixable_issues:
            fixable_issues = issues[:self.config.get('max_bugs_to_test', 10)]
        
        # Run evaluation
        results = evaluator.evaluate_fix_suggestions(
            fixable_issues,
            max_bugs=self.config.get('max_bugs_to_test', 5)
        )
        
        return results
    
    def phase3_code_quality_evaluation(self, fix_results: Dict[str, Any]) -> Dict[str, Any]:
        """Phase 3: Đánh giá chất lượng code sau khi apply fixes"""
        print("\n" + "=" * 60)
        print("📈 PHASE 3: CODE QUALITY EVALUATION")
        print("=" * 60)
        
        analyzer = CodeQualityAnalyzer(
            sonar_url=self.config['sonar_url'],
            sonar_token=self.config.get('sonar_token')
        )
        
        # Extract fixes from previous phase
        fixes_without_rag = fix_results.get('fix_suggestions', {}).get('without_rag', [])
        fixes_with_rag = fix_results.get('fix_suggestions', {}).get('with_rag', [])
        
        # Run analysis
        results = analyzer.analyze_code_quality(
            self.config['source_directory'],
            fixes_without_rag,
            fixes_with_rag
        )
        
        return results
    
    def calculate_final_comparison(self):
        """Tính toán so sánh tổng thể"""
        print("\n" + "=" * 60)
        print("📊 CALCULATING FINAL COMPARISON")
        print("=" * 60)
        
        bug_detection = self.results['phase_results']['bug_detection']
        fix_suggestions = self.results['phase_results']['fix_suggestions']
        code_quality = self.results['phase_results']['code_quality']
        
        # Extract key metrics
        comparison = {
            "bug_detection_accuracy": {
                "without_rag": bug_detection.get('comparison_metrics', {}).get('accuracy', {}).get('without_rag', 0),
                "with_rag": bug_detection.get('comparison_metrics', {}).get('accuracy', {}).get('with_rag', 0)
            },
            "fix_suggestion_quality": {
                "without_rag": fix_suggestions.get('comparison_metrics', {}).get('fix_quality_scores', {}).get('without_rag_avg', 0),
                "with_rag": fix_suggestions.get('comparison_metrics', {}).get('fix_quality_scores', {}).get('with_rag_avg', 0)
            },
            "token_efficiency": {
                "without_rag": fix_suggestions.get('comparison_metrics', {}).get('token_usage', {}).get('without_rag', 0),
                "with_rag": fix_suggestions.get('comparison_metrics', {}).get('token_usage', {}).get('with_rag', 0)
            },
            "code_quality_improvement": {
                "without_rag": code_quality.get('comparison', {}).get('quality_scores', {}).get('without_rag', 0),
                "with_rag": code_quality.get('comparison', {}).get('quality_scores', {}).get('with_rag', 0)
            }
        }
        
        # Calculate overall RAG effectiveness score
        rag_effectiveness = self.calculate_rag_effectiveness_score(comparison)
        
        self.results['final_comparison'] = {
            "detailed_metrics": comparison,
            "rag_effectiveness_score": rag_effectiveness,
            "summary": self.generate_summary(comparison, rag_effectiveness)
        }
    
    def calculate_rag_effectiveness_score(self, comparison: Dict[str, Any]) -> Dict[str, Any]:
        """Tính điểm hiệu quả tổng thể của RAG"""
        scores = {
            "bug_detection": 0,
            "fix_quality": 0,
            "token_efficiency": 0,
            "code_quality": 0,
            "overall": 0
        }
        
        # Bug detection improvement (0-25 points)
        bug_det_without = comparison['bug_detection_accuracy']['without_rag']
        bug_det_with = comparison['bug_detection_accuracy']['with_rag']
        if bug_det_without > 0:
            bug_improvement = (bug_det_with - bug_det_without) / bug_det_without
            scores['bug_detection'] = min(25, max(0, bug_improvement * 100))
        
        # Fix quality improvement (0-25 points)
        fix_qual_without = comparison['fix_suggestion_quality']['without_rag']
        fix_qual_with = comparison['fix_suggestion_quality']['with_rag']
        if fix_qual_without > 0:
            fix_improvement = (fix_qual_with - fix_qual_without) / fix_qual_without
            scores['fix_quality'] = min(25, max(0, fix_improvement * 100))
        
        # Token efficiency (0-25 points) - penalize if RAG uses significantly more tokens
        token_without = comparison['token_efficiency']['without_rag']
        token_with = comparison['token_efficiency']['with_rag']
        if token_without > 0:
            token_ratio = token_with / token_without
            if token_ratio <= 1.2:  # Up to 20% increase is acceptable
                scores['token_efficiency'] = 25
            elif token_ratio <= 1.5:  # 20-50% increase
                scores['token_efficiency'] = 15
            elif token_ratio <= 2.0:  # 50-100% increase
                scores['token_efficiency'] = 5
            else:  # More than 100% increase
                scores['token_efficiency'] = 0
        
        # Code quality improvement (0-25 points)
        code_qual_without = comparison['code_quality_improvement']['without_rag']
        code_qual_with = comparison['code_quality_improvement']['with_rag']
        if code_qual_without > 0:
            code_improvement = (code_qual_with - code_qual_without) / code_qual_without
            scores['code_quality'] = min(25, max(0, code_improvement * 100))
        
        # Overall score
        scores['overall'] = sum([scores['bug_detection'], scores['fix_quality'], 
                                scores['token_efficiency'], scores['code_quality']])
        
        return scores
    
    def generate_summary(self, comparison: Dict[str, Any], effectiveness: Dict[str, Any]) -> Dict[str, Any]:
        """Tạo tóm tắt kết quả"""
        overall_score = effectiveness['overall']
        
        if overall_score >= 80:
            verdict = "RAG significantly improves the bug fixing process"
            recommendation = "Strongly recommend using RAG for bug detection and fixing"
        elif overall_score >= 60:
            verdict = "RAG provides moderate improvements"
            recommendation = "Consider using RAG, especially for complex bug scenarios"
        elif overall_score >= 40:
            verdict = "RAG provides limited improvements"
            recommendation = "RAG may be beneficial in specific scenarios, evaluate cost vs benefit"
        else:
            verdict = "RAG does not provide significant improvements"
            recommendation = "Current RAG implementation may need optimization or may not be suitable"
        
        return {
            "overall_score": overall_score,
            "verdict": verdict,
            "recommendation": recommendation,
            "key_findings": self.extract_key_findings(comparison)
        }
    
    def extract_key_findings(self, comparison: Dict[str, Any]) -> List[str]:
        """Trích xuất các phát hiện chính"""
        findings = []
        
        # Bug detection findings
        bug_det_improvement = comparison['bug_detection_accuracy']['with_rag'] - comparison['bug_detection_accuracy']['without_rag']
        if bug_det_improvement > 0.05:  # 5% improvement
            findings.append(f"RAG improved bug detection accuracy by {bug_det_improvement:.1%}")
        elif bug_det_improvement < -0.05:
            findings.append(f"RAG decreased bug detection accuracy by {abs(bug_det_improvement):.1%}")
        
        # Fix quality findings
        fix_qual_improvement = comparison['fix_suggestion_quality']['with_rag'] - comparison['fix_suggestion_quality']['without_rag']
        if fix_qual_improvement > 0.5:  # 0.5 point improvement on 1-10 scale
            findings.append(f"RAG improved fix suggestion quality by {fix_qual_improvement:.1f} points")
        elif fix_qual_improvement < -0.5:
            findings.append(f"RAG decreased fix suggestion quality by {abs(fix_qual_improvement):.1f} points")
        
        # Token usage findings
        token_ratio = comparison['token_efficiency']['with_rag'] / comparison['token_efficiency']['without_rag'] if comparison['token_efficiency']['without_rag'] > 0 else 1
        if token_ratio > 1.5:
            findings.append(f"RAG increased token usage by {(token_ratio-1)*100:.0f}%")
        elif token_ratio < 0.8:
            findings.append(f"RAG reduced token usage by {(1-token_ratio)*100:.0f}%")
        
        # Code quality findings
        code_qual_improvement = comparison['code_quality_improvement']['with_rag'] - comparison['code_quality_improvement']['without_rag']
        if code_qual_improvement > 5:  # 5 point improvement
            findings.append(f"RAG improved overall code quality by {code_qual_improvement:.1f} points")
        elif code_qual_improvement < -5:
            findings.append(f"RAG decreased overall code quality by {abs(code_qual_improvement):.1f} points")
        
        return findings
    
    def generate_recommendations(self):
        """Tạo khuyến nghị dựa trên kết quả"""
        effectiveness = self.results['final_comparison']['rag_effectiveness_score']
        
        recommendations = []
        
        # Bug detection recommendations
        if effectiveness['bug_detection'] < 10:
            recommendations.append("Consider improving RAG retrieval quality for bug detection")
            recommendations.append("Review and expand the bug history database")
        
        # Fix quality recommendations
        if effectiveness['fix_quality'] < 10:
            recommendations.append("Enhance the fix suggestion prompts and context")
            recommendations.append("Include more diverse fix examples in the RAG database")
        
        # Token efficiency recommendations
        if effectiveness['token_efficiency'] < 10:
            recommendations.append("Optimize RAG retrieval to reduce token usage")
            recommendations.append("Implement better context filtering and summarization")
        
        # Code quality recommendations
        if effectiveness['code_quality'] < 10:
            recommendations.append("Validate fix suggestions before applying to code")
            recommendations.append("Implement post-fix quality checks")
        
        # General recommendations
        if effectiveness['overall'] < 50:
            recommendations.append("Consider fine-tuning the RAG model with domain-specific data")
            recommendations.append("Evaluate alternative RAG architectures or embedding models")
        
        self.results['recommendations'] = recommendations
    
    def generate_final_report(self) -> str:
        """Tạo báo cáo tổng hợp cuối cùng"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f'comprehensive_rag_evaluation_{timestamp}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Also generate a human-readable summary
        summary_file = f'rag_evaluation_summary_{timestamp}.md'
        self.generate_markdown_summary(summary_file)
        
        return report_file, summary_file
    
    def generate_markdown_summary(self, filename: str):
        """Tạo tóm tắt dạng Markdown"""
        final_comp = self.results['final_comparison']
        effectiveness = final_comp['rag_effectiveness_score']
        summary = final_comp['summary']
        
        content = f"""# RAG Evaluation Summary

**Evaluation Date:** {self.results['evaluation_metadata']['start_time']}

## Overall Results

**RAG Effectiveness Score:** {effectiveness['overall']:.1f}/100

**Verdict:** {summary['verdict']}

**Recommendation:** {summary['recommendation']}

## Detailed Scores

| Metric | Score | Description |
|--------|-------|-------------|
| Bug Detection | {effectiveness['bug_detection']:.1f}/25 | Accuracy improvement in identifying real bugs vs false positives |
| Fix Quality | {effectiveness['fix_quality']:.1f}/25 | Quality of suggested fixes |
| Token Efficiency | {effectiveness['token_efficiency']:.1f}/25 | Efficient use of AI tokens |
| Code Quality | {effectiveness['code_quality']:.1f}/25 | Improvement in overall code quality after fixes |

## Key Findings

"""
        
        for finding in summary['key_findings']:
            content += f"- {finding}\n"
        
        content += "\n## Recommendations\n\n"
        
        for rec in self.results['recommendations']:
            content += f"- {rec}\n"
        
        content += f"""

## Configuration Used

- Max bugs tested: {self.config.get('max_bugs_to_test', 'N/A')}
- Source directory: {self.config.get('source_directory', 'N/A')}
- FixChain URL: {self.config.get('fixchain_url', 'N/A')}
- SonarQube URL: {self.config.get('sonar_url', 'N/A')}

---

*Generated by Comprehensive RAG Evaluation Tool*
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def run_comprehensive_evaluation(self) -> Dict[str, str]:
        """Chạy toàn bộ quy trình đánh giá"""
        print("🚀 Starting Comprehensive RAG Evaluation")
        print("=" * 60)
        
        self.results['evaluation_metadata']['start_time'] = datetime.now().isoformat()
        
        try:
            # Setup environment
            if not self.setup_environment():
                raise Exception("Environment setup failed")
            
            # Run SonarQube scan if needed
            issues_file = self.config.get('issues_file')
            if not issues_file or not os.path.exists(issues_file):
                print("📊 No existing issues file found, running SonarQube scan...")
                issues_file = self.run_sonar_scan_and_export(self.config['source_directory'])
                if not issues_file:
                    raise Exception("Failed to generate issues file")
            else:
                print(f"📁 Using existing issues file: {issues_file}")
            
            # Phase 1: Bug Detection Evaluation
            self.results['phase_results']['bug_detection'] = self.phase1_bug_detection_evaluation(issues_file)
            
            # Phase 2: Fix Suggestion Evaluation
            self.results['phase_results']['fix_suggestions'] = self.phase2_fix_suggestion_evaluation(issues_file)
            
            # Phase 3: Code Quality Evaluation
            self.results['phase_results']['code_quality'] = self.phase3_code_quality_evaluation(
                self.results['phase_results']['fix_suggestions']
            )
            
            # Calculate final comparison
            self.calculate_final_comparison()
            
            # Generate recommendations
            self.generate_recommendations()
            
            # Generate final report
            report_file, summary_file = self.generate_final_report()
            
            self.results['evaluation_metadata']['end_time'] = datetime.now().isoformat()
            
            print("\n" + "=" * 60)
            print("✅ COMPREHENSIVE RAG EVALUATION COMPLETED")
            print("=" * 60)
            print(f"📄 Detailed report: {report_file}")
            print(f"📋 Summary report: {summary_file}")
            
            # Print final summary
            final_comp = self.results['final_comparison']
            effectiveness = final_comp['rag_effectiveness_score']
            summary = final_comp['summary']
            
            print(f"\n🎯 RAG Effectiveness Score: {effectiveness['overall']:.1f}/100")
            print(f"📊 Verdict: {summary['verdict']}")
            print(f"💡 Recommendation: {summary['recommendation']}")
            
            return {
                "detailed_report": report_file,
                "summary_report": summary_file,
                "overall_score": effectiveness['overall']
            }
        
        except Exception as e:
            print(f"❌ Evaluation failed: {e}")
            self.results['evaluation_metadata']['end_time'] = datetime.now().isoformat()
            self.results['evaluation_metadata']['error'] = str(e)
            
            # Save partial results
            error_report = f'rag_evaluation_error_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            with open(error_report, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
            
            return {
                "error_report": error_report,
                "error": str(e)
            }

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Comprehensive RAG Evaluation Tool')
    parser.add_argument('--source-dir', default=os.getcwd(), help='Source directory to analyze')
    parser.add_argument('--max-bugs', type=int, default=10, help='Maximum number of bugs to test')
    parser.add_argument('--fixchain-url', default='http://localhost:8002', help='FixChain API URL')
    parser.add_argument('--sonar-url', default='http://localhost:9000', help='SonarQube URL')
    parser.add_argument('--sonar-token', help='SonarQube authentication token')
    parser.add_argument('--issues-file', help='Existing SonarQube issues file')
    parser.add_argument('--gemini-api-key', help='Gemini API key')
    
    args = parser.parse_args()
    
    # Load Gemini API key from environment if not provided
    gemini_api_key = args.gemini_api_key or os.getenv('GEMINI_API_KEY')
    
    config = {
        'source_directory': args.source_dir,
        'max_bugs_to_test': args.max_bugs,
        'fixchain_url': args.fixchain_url,
        'sonar_url': args.sonar_url,
        'sonar_token': args.sonar_token,
        'sonar_project_key': 'comprehensive-test',
        'issues_file': args.issues_file,
        'gemini_api_key': gemini_api_key
    }
    
    print("🔍 Comprehensive RAG Evaluation Tool")
    print("=" * 50)
    print(f"Source Directory: {config['source_directory']}")
    print(f"Max Bugs to Test: {config['max_bugs_to_test']}")
    print(f"FixChain URL: {config['fixchain_url']}")
    print(f"SonarQube URL: {config['sonar_url']}")
    
    # Initialize and run evaluation
    evaluator = ComprehensiveRAGEvaluation(config)
    results = evaluator.run_comprehensive_evaluation()
    
    if 'error' in results:
        print(f"\n❌ Evaluation failed: {results['error']}")
        print(f"📄 Error report saved to: {results['error_report']}")
        return 1
    else:
        print(f"\n✅ Evaluation completed successfully!")
        print(f"📊 Overall RAG Effectiveness Score: {results['overall_score']:.1f}/100")
        return 0

if __name__ == "__main__":
    exit(main())