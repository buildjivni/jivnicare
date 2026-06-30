import json

log_path = r"C:\Users\dharm\.gemini\antigravity\brain\f38e1754-fed2-42be-9702-0592d34035a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Search model planning, code action, system responses, etc.
            text = json.dumps(data)
            if 'ep-proud-heart' in text or 'neon.tech' in text:
                if 'DATABASE_URL' in text and 'postgresql://' in text:
                    # Extract the database URL
                    idx = text.find('postgresql://')
                    if idx != -1:
                        end_idx = text.find('"', idx)
                        if end_idx == -1:
                            end_idx = text.find('\\', idx)
                        print(f"Found URL: {text[idx:end_idx]}")
        except Exception:
            pass
