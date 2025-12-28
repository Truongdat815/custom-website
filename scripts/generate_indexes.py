import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def count_lines(root: str) -> int:
    total = 0
    for base, _, files in os.walk(root):
        for f in files:
            path = os.path.join(base, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                    total += sum(1 for _ in fh)
            except Exception:
                pass
    return total

def list_files(rel_path: str, exts=None):
    exts = set(exts or [])
    target = os.path.join(ROOT, rel_path)
    result = []
    for base, _, files in os.walk(target):
        for f in files:
            if exts and not any(f.endswith(ext) for ext in exts):
                continue
            rel = os.path.relpath(os.path.join(base, f), ROOT).replace('\\', '/')
            result.append(rel)
    result.sort()
    return result

def main():
    data_dir = os.path.join(ROOT, 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Total line count
    total_lines = count_lines(ROOT)
    with open(os.path.join(data_dir, 'line_count.json'), 'w', encoding='utf-8') as f:
        json.dump({"lines": total_lines}, f, ensure_ascii=False, indent=2)

    # Modules and docs listing
    modules = list_files('src/modules', exts=['.js', '.ts'])
    docs = list_files('docs', exts=['.md'])

    with open(os.path.join(data_dir, 'modules.json'), 'w', encoding='utf-8') as f:
        json.dump({"files": modules}, f, ensure_ascii=False, indent=2)

    with open(os.path.join(data_dir, 'docs.json'), 'w', encoding='utf-8') as f:
        json.dump({"files": docs}, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
