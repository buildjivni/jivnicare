import json

log_path = r"C:\Users\dharm\.gemini\antigravity\brain\f38e1754-fed2-42be-9702-0592d34035a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'RUN_COMMAND':
                content = data.get('content', '')
                if 'Doctors in DB:' in content or 'successfully' in content:
                    print(f"Step {data.get('step_index')}: {content[:500]}")
        except Exception:
            pass
