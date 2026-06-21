"""
Fix pptxgenjs presentation.xml element ordering for OOXML XSD compliance.

Usage: python fix_pptx.py input.pptx [output.pptx]
If output omitted, overwrites input.
"""

import sys
import tempfile
import zipfile
from pathlib import Path

import defusedxml.minidom

# OOXML presentation child order (subset used by pptxgenjs)
ORDER = [
    "sldMasterIdLst",
    "notesMasterIdLst",
    "handoutMasterIdLst",
    "sldIdLst",
    "sldSz",
    "notesSz",
    "smartTags",
    "embeddedFontLst",
    "custShowLst",
    "photoAlbum",
    "custDataLst",
    "defaultTextStyle",
    "modificationVerifier",
    "extLst",
]

NS = "http://schemas.openxmlformats.org/presentationml/2006/main"


def local_name(node):
    if node.nodeType != node.ELEMENT_NODE:
        return None
    tag = node.tagName
    return tag.split(":")[-1] if ":" in tag else tag


def fix_presentation_xml(xml_text: str) -> str:
    dom = defusedxml.minidom.parseString(xml_text.encode("utf-8"))
    pres = dom.getElementsByTagName("p:presentation")
    if not pres:
        pres = [n for n in dom.childNodes if getattr(n, "tagName", "").endswith("presentation")]
    if not pres:
        return xml_text

    root = pres[0]
    children = [c for c in root.childNodes if c.nodeType == c.ELEMENT_NODE]
    by_name: dict[str, list] = {}
    for c in children:
        name = local_name(c)
        if name:
            by_name.setdefault(name, []).append(c)

    for c in children:
        root.removeChild(c)

    for name in ORDER:
        for node in by_name.get(name, []):
            root.appendChild(node)

    for name, nodes in by_name.items():
        if name not in ORDER:
            for node in nodes:
                root.appendChild(node)

    return dom.toxml(encoding="UTF-8").decode("utf-8")


def main():
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        with zipfile.ZipFile(src, "r") as zin:
            zin.extractall(tmp_path)

        pres_path = tmp_path / "ppt" / "presentation.xml"
        if pres_path.exists():
            fixed = fix_presentation_xml(pres_path.read_text(encoding="utf-8"))
            pres_path.write_text(fixed, encoding="utf-8")

        with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
            for file in sorted(tmp_path.rglob("*")):
                if file.is_file():
                    zout.write(file, file.relative_to(tmp_path).as_posix())

    print(f"Fixed: {dst}")


if __name__ == "__main__":
    main()
