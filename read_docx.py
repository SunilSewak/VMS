import zipfile
import re
import html

def extract_docx_text(docx_path, out_txt_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml').decode('utf-8')
            
            # Simple regex to get text between <w:t> tags
            text_runs = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml_content)
            
            # Join and decode HTML entities
            full_text = "\n".join(html.unescape(run) for run in text_runs)
            
            # Clean up consecutive empty lines
            full_text = re.sub(r'\n+', '\n', full_text)
            
            with open(out_txt_path, 'w', encoding='utf-8') as f:
                f.write(full_text)
            print(f"Successfully extracted text to {out_txt_path}")
    except Exception as e:
        print("Error reading docx:", e)

# Extract from schema specification doc
extract_docx_text(
    r"c:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS\AVEMS — DATABASE SCHEMA SPECIFICATION.docx",
    r"c:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS\schema_spec.txt"
)
