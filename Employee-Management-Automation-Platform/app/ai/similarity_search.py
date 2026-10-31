import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(
    path="ai/knowldge/chroma_db"
)

collection = client.get_or_create_collection(
    name="company_knowledge"
)


def similarity_search(question, top_k=3):
    question_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    matches = []

    for document, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        matches.append({
            "text": document,
            "filename": metadata["filename"],
            "distance": round(distance, 4)
        })

    return matches


# if __name__ == "__main__":
#     question = input("Enter your question: ")

#     results = similarity_search(question)

#     if results:
#         for result in results:
#             print("\nSource:", result["filename"])
#             print("Distance:", result["distance"])
#             print("Text:", result["text"])
#     else:
#         print("No relevant information found.")