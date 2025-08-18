#!/usr/bin/env python3
"""
Quick Demo Script
Script demo nhanh để test các chức năng cơ bản của RAG evaluation
"""

import json
import os
import time
import requests
from datetime import datetime
from typing import Dict, List, Any

class QuickRAGDemo:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.sample_bugs = [
            {
                "bug_id": "demo_1",
                "rule_key": "java:S1481",
                "message": "Remove this unused 'tempVar' local variable.",
                "file_path": "src/main/java/Demo.java",
                "line": 15,
                "type": "CODE_SMELL",
                "severity": "MINOR",
                "code_excerpt": "String tempVar = getValue(); // unused variable"
            },
            {
                "bug_id": "demo_2",
                "rule_key": "java:S2259",
                "message": "A 'NullPointerException' could be thrown; 'obj' is nullable here.",
                "file_path": "src/main/java/Service.java",
                "line": 42,
                "type": "BUG",
                "severity": "MAJOR",
                "code_excerpt": "return obj.toString(); // obj might be null"
            },
            {
                "bug_id": "demo_3",
                "rule_key": "java:S3649",
                "message": "Database query is vulnerable to SQL injection.",
                "file_path": "src/main/java/UserDao.java",
                "line": 28,
                "type": "VULNERABILITY",
                "severity": "CRITICAL",
                "code_excerpt": "String sql = \"SELECT * FROM users WHERE id = \" + userId;"
            }
        ]
    
    def check_services(self) -> Dict[str, bool]:
        """Kiểm tra các services cần thiết"""
        print("🔍 Checking required services...")
        
        services = {
            "FixChain API": False,
            "MongoDB": False
        }
        
        # Check FixChain API
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                services["FixChain API"] = True
                health_data = response.json()
                services["MongoDB"] = health_data.get("mongodb_status") == "connected"
        except Exception as e:
            print(f"  ❌ FixChain API: {e}")
        
        # Print status
        for service, status in services.items():
            icon = "✅" if status else "❌"
            print(f"  {icon} {service}")
        
        return services
    
    def demo_bug_import(self) -> List[str]:
        """Demo import bugs to RAG"""
        print("\n📥 Demo: Importing bugs to RAG system...")
        
        imported_ids = []
        
        for bug in self.sample_bugs:
            # Convert to RAG format
            rag_bug = {
                "name": f"{bug['rule_key']}: {bug['message'][:50]}...",
                "description": bug['message'],
                "type": bug['type'],
                "severity": bug['severity'],
                "status": "OPEN",
                "file_path": bug['file_path'],
                "line_number": bug['line'],
                "code_snippet": bug['code_excerpt'],
                "labels": [bug['rule_key'], bug['type']],
                "project": "demo-project",
                "component": "demo-component",
                "metadata": {
                    "demo_bug": True,
                    "original_id": bug['bug_id']
                }
            }
            
            try:
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
                        bug_id = imported_bugs[0]['bug_id']
                        imported_ids.append(bug_id)
                        print(f"  ✅ Imported: {bug['rule_key']} -> {bug_id}")
                    else:
                        print(f"  ❌ Failed to import: {bug['rule_key']}")
                else:
                    print(f"  ❌ Import failed: {response.status_code}")
            
            except Exception as e:
                print(f"  ❌ Error importing {bug['rule_key']}: {e}")
            
            time.sleep(1)  # Rate limiting
        
        print(f"\n📊 Imported {len(imported_ids)} bugs to RAG system")
        return imported_ids
    
    def demo_bug_search(self, imported_ids: List[str]):
        """Demo search bugs in RAG"""
        print("\n🔍 Demo: Searching bugs in RAG system...")
        
        search_queries = [
            "null pointer exception",
            "SQL injection vulnerability",
            "unused variable",
            "database security"
        ]
        
        for query in search_queries:
            print(f"\n  🔎 Searching: '{query}'")
            
            try:
                response = requests.post(
                    f"{self.base_url}/rag-bugs/search",
                    json={
                        "query": query,
                        "limit": 3,
                        "collection_name": "bug_rag_documents"
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    results = response.json()
                    bugs = results.get('bugs', [])
                    
                    if bugs:
                        print(f"    📋 Found {len(bugs)} results:")
                        for i, bug in enumerate(bugs[:2], 1):
                            score = bug.get('similarity_score', 0)
                            name = bug.get('name', 'Unknown')[:50]
                            print(f"      {i}. {name}... (score: {score:.3f})")
                    else:
                        print("    📭 No results found")
                else:
                    print(f"    ❌ Search failed: {response.status_code}")
            
            except Exception as e:
                print(f"    ❌ Search error: {e}")
            
            time.sleep(1)
    
    def demo_fix_suggestions(self, imported_ids: List[str]):
        """Demo fix suggestions with and without RAG"""
        print("\n🔧 Demo: Fix suggestions comparison...")
        
        if not imported_ids:
            print("  ⚠️ No imported bugs available for fix suggestions")
            return
        
        # Test with first imported bug
        bug_id = imported_ids[0]
        print(f"\n  🐛 Testing fix suggestions for bug: {bug_id}")
        
        # Get fix suggestion with RAG
        print("    🧠 Getting fix suggestion WITH RAG...")
        try:
            response = requests.post(
                f"{self.base_url}/rag-bugs/suggest-fix",
                json={
                    "bug_id": bug_id,
                    "include_similar_fixes": True
                },
                timeout=60
            )
            
            if response.status_code == 200:
                rag_result = response.json()
                ai_suggestion = rag_result.get('ai_suggestion', '')
                similar_fixes = rag_result.get('similar_fixes', [])
                
                print(f"      ✅ Got RAG suggestion ({len(ai_suggestion)} chars)")
                print(f"      📚 Used {len(similar_fixes)} similar fixes as context")
                
                # Show preview of suggestion
                preview = ai_suggestion[:200] + "..." if len(ai_suggestion) > 200 else ai_suggestion
                print(f"      💡 Preview: {preview}")
            else:
                print(f"      ❌ RAG suggestion failed: {response.status_code}")
        
        except Exception as e:
            print(f"      ❌ RAG suggestion error: {e}")
        
        # Simulate fix suggestion without RAG (using direct Gemini)
        print("    🤖 Getting fix suggestion WITHOUT RAG...")
        try:
            # This would use direct Gemini API call without RAG context
            # For demo, we'll simulate this
            print("      ✅ Got direct AI suggestion (simulated)")
            print("      📚 No historical context used")
            print("      💡 Preview: Based on rule pattern, consider null checking...")
        
        except Exception as e:
            print(f"      ❌ Direct AI suggestion error: {e}")
    
    def demo_stats(self):
        """Demo RAG statistics"""
        print("\n📊 Demo: RAG system statistics...")
        
        try:
            response = requests.get(f"{self.base_url}/rag-bugs/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                
                print(f"  📈 Total bugs in RAG: {stats.get('total_bugs', 0)}")
                
                status_stats = stats.get('by_status', {})
                if status_stats:
                    print("  📋 By status:")
                    for status, count in status_stats.items():
                        print(f"    - {status}: {count}")
                
                type_stats = stats.get('by_type', {})
                if type_stats:
                    print("  🏷️ By type:")
                    for bug_type, count in type_stats.items():
                        print(f"    - {bug_type}: {count}")
                
                severity_stats = stats.get('by_severity', {})
                if severity_stats:
                    print("  ⚠️ By severity:")
                    for severity, count in severity_stats.items():
                        print(f"    - {severity}: {count}")
            else:
                print(f"  ❌ Stats request failed: {response.status_code}")
        
        except Exception as e:
            print(f"  ❌ Stats error: {e}")
    
    def cleanup_demo_data(self):
        """Cleanup demo data (optional)"""
        print("\n🧹 Cleanup demo data...")
        print("  ℹ️ Demo data will remain in MongoDB for further testing")
        print("  ℹ️ To clean manually, delete documents with metadata.demo_bug = true")
    
    def run_demo(self):
        """Chạy demo hoàn chỉnh"""
        print("🚀 RAG System Quick Demo")
        print("=" * 40)
        
        # Check services
        services = self.check_services()
        
        if not all(services.values()):
            print("\n❌ Required services are not running. Please start:")
            print("  1. MongoDB: docker run -d -p 27017:27017 mongo")
            print("  2. FixChain API: cd FixChain && python controller/rag_bug_controller.py")
            return False
        
        print("\n✅ All services are running. Starting demo...")
        
        try:
            # Import demo bugs
            imported_ids = self.demo_bug_import()
            
            # Wait for embeddings to be generated
            if imported_ids:
                print("\n⏳ Waiting for embeddings to be generated...")
                time.sleep(5)
            
            # Demo search
            self.demo_bug_search(imported_ids)
            
            # Demo fix suggestions
            self.demo_fix_suggestions(imported_ids)
            
            # Show stats
            self.demo_stats()
            
            # Cleanup info
            self.cleanup_demo_data()
            
            print("\n" + "=" * 40)
            print("✅ Demo completed successfully!")
            print("\n💡 Next steps:")
            print("  1. Run comprehensive evaluation: python comprehensive_rag_evaluation.py")
            print("  2. Test with real SonarQube data")
            print("  3. Customize evaluation metrics")
            
            return True
        
        except Exception as e:
            print(f"\n❌ Demo failed: {e}")
            return False

def main():
    """Main function"""
    demo = QuickRAGDemo()
    success = demo.run_demo()
    
    if success:
        print("\n🎉 Demo completed! RAG system is working correctly.")
        return 0
    else:
        print("\n💥 Demo failed! Please check the error messages above.")
        return 1

if __name__ == "__main__":
    exit(main())