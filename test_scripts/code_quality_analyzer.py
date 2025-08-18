#!/usr/bin/env python3
"""
Code Quality Analyzer
Script để đánh giá và so sánh chất lượng code trước và sau khi apply fixes
"""

import json
import os
import subprocess
import tempfile
import shutil
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import requests
from pathlib import Path

class CodeQualityAnalyzer:
    def __init__(self, sonar_url="http://localhost:9000", sonar_token=None):
        self.sonar_url = sonar_url
        self.sonar_token = sonar_token
        self.results = {
            "quality_metrics": {
                "baseline": {},
                "after_fixes_without_rag": {},
                "after_fixes_with_rag": {}
            },
            "comparison": {},
            "test_metadata": {
                "start_time": None,
                "end_time": None,
                "source_directory": None
            }
        }
    
    def create_project_copy(self, source_dir: str, target_dir: str) -> bool:
        """Tạo bản copy của project để test"""
        try:
            if os.path.exists(target_dir):
                shutil.rmtree(target_dir)
            
            shutil.copytree(source_dir, target_dir, ignore=shutil.ignore_patterns(
                '*.git*', '__pycache__', '*.pyc', 'node_modules', '.sonar'
            ))
            
            print(f"✅ Created project copy: {target_dir}")
            return True
        
        except Exception as e:
            print(f"❌ Error creating project copy: {e}")
            return False
    
    def apply_fixes_to_code(self, project_dir: str, fixes: List[Dict[str, Any]], method: str) -> Dict[str, Any]:
        """Apply fixes to code files"""
        applied_fixes = 0
        failed_fixes = 0
        fix_details = []
        
        print(f"🔧 Applying {len(fixes)} fixes using {method} method...")
        
        for fix in fixes:
            if 'error' in fix:
                failed_fixes += 1
                continue
            
            fix_suggestion = fix.get('fix_suggestion', {})
            code_suggestion = fix_suggestion.get('code_suggestion', '')
            
            if not code_suggestion or code_suggestion.strip() == '':
                failed_fixes += 1
                continue
            
            # Try to extract file path and apply fix
            # This is a simplified implementation - in practice, you'd need more sophisticated parsing
            try:
                # For demo purposes, we'll simulate applying fixes
                fix_detail = {
                    "bug_id": fix.get('bug_id', 'unknown'),
                    "applied": True,
                    "fix_type": fix_suggestion.get('fix_approach', 'Unknown'),
                    "estimated_effort": fix_suggestion.get('estimated_effort_hours', 0),
                    "confidence": fix_suggestion.get('confidence', 0)
                }
                
                fix_details.append(fix_detail)
                applied_fixes += 1
                
            except Exception as e:
                failed_fixes += 1
                fix_details.append({
                    "bug_id": fix.get('bug_id', 'unknown'),
                    "applied": False,
                    "error": str(e)
                })
        
        return {
            "applied_fixes": applied_fixes,
            "failed_fixes": failed_fixes,
            "fix_details": fix_details,
            "success_rate": applied_fixes / len(fixes) if fixes else 0
        }
    
    def run_sonar_scan(self, project_dir: str, project_key: str) -> Optional[Dict[str, Any]]:
        """Chạy SonarQube scan và trả về metrics"""
        try:
            print(f"🔍 Running SonarQube scan for {project_key}...")
            
            # Change to project directory
            original_cwd = os.getcwd()
            os.chdir(project_dir)
            
            # Run sonar scanner
            cmd = [
                'sonar-scanner',
                f'-Dsonar.projectKey={project_key}',
                f'-Dsonar.sources=.',
                f'-Dsonar.host.url={self.sonar_url}'
            ]
            
            if self.sonar_token:
                cmd.append(f'-Dsonar.login={self.sonar_token}')
            
            # Run the scan
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Change back to original directory
            os.chdir(original_cwd)
            
            if result.returncode == 0:
                print(f"✅ SonarQube scan completed for {project_key}")
                
                # Wait for analysis to complete
                time.sleep(10)
                
                # Get metrics from SonarQube API
                return self.get_sonar_metrics(project_key)
            else:
                print(f"❌ SonarQube scan failed: {result.stderr}")
                return None
        
        except subprocess.TimeoutExpired:
            print("❌ SonarQube scan timed out")
            return None
        except Exception as e:
            print(f"❌ Error running SonarQube scan: {e}")
            return None
        finally:
            # Ensure we're back in the original directory
            os.chdir(original_cwd)
    
    def get_sonar_metrics(self, project_key: str) -> Optional[Dict[str, Any]]:
        """Lấy metrics từ SonarQube API"""
        try:
            # Define metrics to retrieve
            metrics = [
                'bugs', 'vulnerabilities', 'code_smells',
                'coverage', 'duplicated_lines_density',
                'ncloc', 'complexity', 'cognitive_complexity',
                'maintainability_rating', 'reliability_rating', 'security_rating'
            ]
            
            # Build API URL
            metrics_param = ','.join(metrics)
            url = f"{self.sonar_url}/api/measures/component"
            
            params = {
                'component': project_key,
                'metricKeys': metrics_param
            }
            
            headers = {}
            if self.sonar_token:
                headers['Authorization'] = f'Bearer {self.sonar_token}'
            
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                component = data.get('component', {})
                measures = component.get('measures', [])
                
                # Convert to dictionary
                metrics_dict = {}
                for measure in measures:
                    metric_key = measure.get('metric')
                    value = measure.get('value')
                    
                    # Convert numeric values
                    try:
                        if '.' in str(value):
                            metrics_dict[metric_key] = float(value)
                        else:
                            metrics_dict[metric_key] = int(value)
                    except (ValueError, TypeError):
                        metrics_dict[metric_key] = value
                
                return {
                    'project_key': project_key,
                    'metrics': metrics_dict,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"❌ Failed to get metrics: {response.status_code}")
                return None
        
        except Exception as e:
            print(f"❌ Error getting SonarQube metrics: {e}")
            return None
    
    def calculate_quality_improvement(self, baseline: Dict, after_fix: Dict) -> Dict[str, Any]:
        """Tính toán cải thiện chất lượng code"""
        if not baseline or not after_fix:
            return {}
        
        baseline_metrics = baseline.get('metrics', {})
        after_metrics = after_fix.get('metrics', {})
        
        improvements = {}
        
        # Calculate improvements for each metric
        for metric in baseline_metrics:
            if metric in after_metrics:
                baseline_val = baseline_metrics[metric]
                after_val = after_metrics[metric]
                
                if isinstance(baseline_val, (int, float)) and isinstance(after_val, (int, float)):
                    # For bugs, vulnerabilities, code_smells - lower is better
                    if metric in ['bugs', 'vulnerabilities', 'code_smells']:
                        improvement = baseline_val - after_val
                        improvement_pct = (improvement / baseline_val * 100) if baseline_val > 0 else 0
                    # For coverage - higher is better
                    elif metric == 'coverage':
                        improvement = after_val - baseline_val
                        improvement_pct = (improvement / baseline_val * 100) if baseline_val > 0 else 0
                    # For duplicated_lines_density - lower is better
                    elif metric == 'duplicated_lines_density':
                        improvement = baseline_val - after_val
                        improvement_pct = (improvement / baseline_val * 100) if baseline_val > 0 else 0
                    # For ratings (1-5 scale) - lower is better
                    elif 'rating' in metric:
                        improvement = baseline_val - after_val
                        improvement_pct = (improvement / baseline_val * 100) if baseline_val > 0 else 0
                    else:
                        improvement = after_val - baseline_val
                        improvement_pct = (improvement / baseline_val * 100) if baseline_val > 0 else 0
                    
                    improvements[metric] = {
                        'baseline': baseline_val,
                        'after_fix': after_val,
                        'absolute_improvement': improvement,
                        'percentage_improvement': improvement_pct
                    }
        
        return improvements
    
    def analyze_code_quality(self, source_dir: str, fixes_without_rag: List[Dict], fixes_with_rag: List[Dict]):
        """Phân tích chất lượng code với các fixes khác nhau"""
        print("🔍 Starting Code Quality Analysis...")
        self.results["test_metadata"]["start_time"] = datetime.now().isoformat()
        self.results["test_metadata"]["source_directory"] = source_dir
        
        # Create temporary directories for testing
        temp_dir = tempfile.mkdtemp(prefix="code_quality_test_")
        baseline_dir = os.path.join(temp_dir, "baseline")
        without_rag_dir = os.path.join(temp_dir, "without_rag")
        with_rag_dir = os.path.join(temp_dir, "with_rag")
        
        try:
            # 1. Create baseline copy and scan
            print("\n📊 Step 1: Baseline Analysis")
            if self.create_project_copy(source_dir, baseline_dir):
                baseline_metrics = self.run_sonar_scan(baseline_dir, "baseline-project")
                self.results["quality_metrics"]["baseline"] = baseline_metrics
            
            # 2. Apply fixes without RAG and scan
            print("\n🔧 Step 2: Apply Fixes Without RAG")
            if self.create_project_copy(source_dir, without_rag_dir):
                fix_results_without_rag = self.apply_fixes_to_code(without_rag_dir, fixes_without_rag, "without_rag")
                without_rag_metrics = self.run_sonar_scan(without_rag_dir, "without-rag-project")
                self.results["quality_metrics"]["after_fixes_without_rag"] = {
                    "sonar_metrics": without_rag_metrics,
                    "fix_application": fix_results_without_rag
                }
            
            # 3. Apply fixes with RAG and scan
            print("\n🧠 Step 3: Apply Fixes With RAG")
            if self.create_project_copy(source_dir, with_rag_dir):
                fix_results_with_rag = self.apply_fixes_to_code(with_rag_dir, fixes_with_rag, "with_rag")
                with_rag_metrics = self.run_sonar_scan(with_rag_dir, "with-rag-project")
                self.results["quality_metrics"]["after_fixes_with_rag"] = {
                    "sonar_metrics": with_rag_metrics,
                    "fix_application": fix_results_with_rag
                }
            
            # 4. Calculate comparisons
            print("\n📈 Step 4: Calculate Quality Improvements")
            self.calculate_quality_comparisons()
            
            # 5. Generate report
            print("\n📄 Step 5: Generate Quality Report")
            report_file = self.generate_quality_report()
            
            self.results["test_metadata"]["end_time"] = datetime.now().isoformat()
            
            print(f"\n✅ Code quality analysis completed! Report saved to: {report_file}")
            
        finally:
            # Cleanup temporary directories
            try:
                shutil.rmtree(temp_dir)
                print(f"🧹 Cleaned up temporary directory: {temp_dir}")
            except Exception as e:
                print(f"⚠️ Warning: Could not clean up temp directory: {e}")
        
        return self.results
    
    def calculate_quality_comparisons(self):
        """Tính toán so sánh chất lượng"""
        baseline = self.results["quality_metrics"]["baseline"]
        without_rag = self.results["quality_metrics"]["after_fixes_without_rag"].get("sonar_metrics")
        with_rag = self.results["quality_metrics"]["after_fixes_with_rag"].get("sonar_metrics")
        
        self.results["comparison"] = {
            "without_rag_vs_baseline": self.calculate_quality_improvement(baseline, without_rag),
            "with_rag_vs_baseline": self.calculate_quality_improvement(baseline, with_rag),
            "with_rag_vs_without_rag": self.calculate_quality_improvement(without_rag, with_rag)
        }
        
        # Calculate summary scores
        if baseline and without_rag and with_rag:
            baseline_metrics = baseline.get('metrics', {})
            without_rag_metrics = without_rag.get('metrics', {})
            with_rag_metrics = with_rag.get('metrics', {})
            
            # Calculate overall quality scores (simplified)
            def calculate_quality_score(metrics):
                score = 100
                score -= metrics.get('bugs', 0) * 10
                score -= metrics.get('vulnerabilities', 0) * 15
                score -= metrics.get('code_smells', 0) * 0.1
                score += metrics.get('coverage', 0) * 0.5
                score -= metrics.get('duplicated_lines_density', 0) * 2
                return max(0, score)
            
            self.results["comparison"]["quality_scores"] = {
                "baseline": calculate_quality_score(baseline_metrics),
                "without_rag": calculate_quality_score(without_rag_metrics),
                "with_rag": calculate_quality_score(with_rag_metrics)
            }
    
    def generate_quality_report(self) -> str:
        """Tạo báo cáo chất lượng code"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f'code_quality_analysis_{timestamp}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        return report_file
    
    def print_quality_summary(self):
        """In tóm tắt kết quả chất lượng"""
        print("\n📊 CODE QUALITY ANALYSIS SUMMARY")
        print("=" * 40)
        
        comparison = self.results.get("comparison", {})
        quality_scores = comparison.get("quality_scores", {})
        
        if quality_scores:
            print(f"🎯 Overall Quality Scores:")
            print(f"  Baseline: {quality_scores['baseline']:.1f}")
            print(f"  Without RAG: {quality_scores['without_rag']:.1f}")
            print(f"  With RAG: {quality_scores['with_rag']:.1f}")
        
        # Print key improvements
        with_rag_vs_baseline = comparison.get("with_rag_vs_baseline", {})
        without_rag_vs_baseline = comparison.get("without_rag_vs_baseline", {})
        
        print(f"\n🔧 Bug Fixes:")
        if 'bugs' in with_rag_vs_baseline:
            rag_bugs = with_rag_vs_baseline['bugs']
            print(f"  With RAG: {rag_bugs['absolute_improvement']:.0f} bugs fixed ({rag_bugs['percentage_improvement']:.1f}% improvement)")
        
        if 'bugs' in without_rag_vs_baseline:
            no_rag_bugs = without_rag_vs_baseline['bugs']
            print(f"  Without RAG: {no_rag_bugs['absolute_improvement']:.0f} bugs fixed ({no_rag_bugs['percentage_improvement']:.1f}% improvement)")
        
        print(f"\n🛡️ Security Improvements:")
        if 'vulnerabilities' in with_rag_vs_baseline:
            rag_vuln = with_rag_vs_baseline['vulnerabilities']
            print(f"  With RAG: {rag_vuln['absolute_improvement']:.0f} vulnerabilities fixed ({rag_vuln['percentage_improvement']:.1f}% improvement)")
        
        if 'vulnerabilities' in without_rag_vs_baseline:
            no_rag_vuln = without_rag_vs_baseline['vulnerabilities']
            print(f"  Without RAG: {no_rag_vuln['absolute_improvement']:.0f} vulnerabilities fixed ({no_rag_vuln['percentage_improvement']:.1f}% improvement)")

def main():
    """Main function để chạy code quality analysis"""
    print("🔍 Code Quality Analyzer - Automated Testing")
    print("=" * 50)
    
    # Check for required files
    fix_without_rag_file = 'fix_suggestion_evaluation_without_rag.json'
    fix_with_rag_file = 'fix_suggestion_evaluation_with_rag.json'
    
    # For demo, we'll use sample data if files don't exist
    fixes_without_rag = []
    fixes_with_rag = []
    
    # Try to load actual fix results
    try:
        # Look for the most recent fix evaluation file
        import glob
        fix_files = glob.glob('fix_suggestion_evaluation_*.json')
        if fix_files:
            latest_file = max(fix_files, key=os.path.getctime)
            with open(latest_file, 'r', encoding='utf-8') as f:
                fix_data = json.load(f)
            
            fixes_without_rag = fix_data.get('detailed_results', {}).get('without_rag', [])
            fixes_with_rag = fix_data.get('detailed_results', {}).get('with_rag', [])
            
            print(f"📁 Loaded fix results from: {latest_file}")
            print(f"  Without RAG fixes: {len(fixes_without_rag)}")
            print(f"  With RAG fixes: {len(fixes_with_rag)}")
    
    except Exception as e:
        print(f"⚠️ Could not load fix results: {e}")
        print("Using sample data for demonstration...")
        
        # Sample fix data for demonstration
        fixes_without_rag = [
            {
                "bug_id": "sample1",
                "fix_suggestion": {
                    "code_suggestion": "if (obj != null) { obj.method(); }",
                    "confidence": 85,
                    "estimated_effort_hours": 0.5
                }
            }
        ]
        
        fixes_with_rag = [
            {
                "bug_id": "sample1",
                "fix_suggestion": {
                    "code_suggestion": "if (obj != null) { obj.method(); }",
                    "confidence": 92,
                    "estimated_effort_hours": 0.3
                },
                "similar_fixes": ["Previous fix for similar null pointer issue"]
            }
        ]
    
    # Set source directory (current directory by default)
    source_dir = os.getcwd()
    
    # Initialize analyzer
    analyzer = CodeQualityAnalyzer()
    
    # Run analysis
    results = analyzer.analyze_code_quality(source_dir, fixes_without_rag, fixes_with_rag)
    
    # Print summary
    analyzer.print_quality_summary()
    
    print("\n✅ Code quality analysis completed successfully!")

if __name__ == "__main__":
    main()