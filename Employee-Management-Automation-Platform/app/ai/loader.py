from pathlib import Path
from chunker import split_text
from embeddings import generate_embeddings
from vectore import store_chunks


def load_documents():
    documents = []

    folder = Path("ai/knowldge")

    print("Folder exists:", folder.exists())
    print("Folder path:", folder.resolve())

    for file in folder.glob("*.txt"):
        text = file.read_text(encoding="utf-8")

        documents.append({
            "filename": file.name,
            "text": text
        })

    print("Files found:", len(documents))

    for document in documents:
        chunks = split_text(document["text"])
        embeddings = generate_embeddings(chunks)

        result = store_chunks(
            chunks,
            embeddings,
            document["filename"]
        )

        print(result)

    return documents



load_documents()