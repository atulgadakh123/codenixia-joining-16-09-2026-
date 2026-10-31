import chromadb

client = chromadb.PersistentClient(
    path="ai/knowldge/chroma_db"
)

collection = client.get_or_create_collection(
    name="company_knowledge"
)


def store_chunks(chunks, embeddings, filename):
    ids = [
        f"{filename}_{i}"
        for i in range(len(chunks))
    ]

    metadatas = [
        {"filename": filename, "chunk_index": i}
        for i in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return {"stored_chunks": len(chunks)}