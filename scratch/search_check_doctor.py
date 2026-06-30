import json

log_path = r"C:\Users\dharm\.gemini\antigravity\brain\f38e1754-fed2-42be-9702-0592d34035a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Find steps running commands with "check_doctor.js"
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                if tc.get('name') == 'run_command' and 'check_doctor.js' in str(tc.get('args', {})):
                    print(f"Step {data.get('step_index')} (Model Thinking): {data.get('thinking', '')[:300]}")
            # Also check system/user response steps following run_command
            content = data.get('content', '')
            if 'check_doctor.js' in content and data.get('type') == 'RUN_COMMAND':
                print(f"Step {data.get('step_index')} (Command Run Output): {content[:500]}")
        except Exception:
            pass
