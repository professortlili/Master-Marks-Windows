import re
import os

def extract_section(file_path, pattern):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    return match.group(1) if match else "Not found"

# Extract HTML
html_content = ""
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()
    match = re.search(r'(<!-- SECTION: ABSENCES -->.*?</section>)', text, re.DOTALL)
    if match: html_content = match.group(1)

# Extract CSS blocks containing "absence" or "calendar"
css_blocks = []
with open("style.css", "r", encoding="utf-8") as f:
    text = f.read()
    blocks = re.split(r'(?<=})\s*', text)
    for block in blocks:
        if 'absence' in block.lower() or 'calendar' in block.lower() or 'trim' in block.lower():
            css_blocks.append(block)
css_content = "\n\n".join(css_blocks)

# Extract JS functions containing "absence"
js_functions = []
with open("script.js", "r", encoding="utf-8") as f:
    text = f.read()
    
    # Simple regex to get functions. It won't get everything perfectly but top-level functions will match
    # find everything matching: function funcName(...) { ... }
    # Since brackets can nest, we do a basic matching by splitting by `function ` or `const name = () =>`
    # Python `re` for nested brackets is hard, so we do simpler:
    lines = text.split('\n')
    current_func = []
    in_func = False
    brace_count = 0
    func_has_absence = False
    for line in lines:
        if ('function ' in line and '{' in line) or ('window.' in line and '= function' in line):
            if not in_func:
                in_func = True
                brace_count = line.count('{') - line.count('}')
                current_func = [line]
                if 'absence' in line.lower() or 'غياب' in line: func_has_absence = True
            else:
                brace_count += line.count('{') - line.count('}')
                current_func.append(line)
        elif in_func:
            current_func.append(line)
            brace_count += line.count('{') - line.count('}')
            if 'absence' in line.lower() or 'غياب' in line: func_has_absence = True
            if brace_count <= 0:
                in_func = False
                if func_has_absence:
                    js_functions.append("\n".join(current_func))
                current_func = []
                func_has_absence = False

js_content = "\n\n".join(js_functions)

with open("Absences_Page_Code.md", "w", encoding="utf-8") as out:
    out.write("# إعدادات صفحة الغيابات (Absences Page Code)\n\n")
    out.write("## 1. قسم HTML\n")
    out.write("قم بنسخ هذا الكود ووضعه في المكان المناسب داخل ملف `index.html`:\n\n")
    out.write("```html\n" + html_content + "\n```\n\n")
    out.write("## 2. قسم CSS\n")
    out.write("قم بإضافة هذه الأنماط (Styles) إلى ملف `style.css`:\n\n")
    out.write("```css\n" + css_content + "\n```\n\n")
    out.write("## 3. قسم JavaScript\n")
    out.write("هذه هي الدوال (Functions) المسؤولة عن الغيابات. قم بنسخها إلى ملف `script.js` الخاص بك:\n\n")
    out.write("```javascript\n" + js_content + "\n```\n")

print("Done. Created Absences_Page_Code.md")
