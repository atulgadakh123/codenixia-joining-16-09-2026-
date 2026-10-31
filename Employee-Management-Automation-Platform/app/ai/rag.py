import ollama
from ai.similarity_search import similarity_search

LLM_MODEL = "llama3.2"


def ask_question(question):
    results = similarity_search(question, top_k=3)
    print("RAG QUESTION:", question)
    print("RAG RESULTS:", results)

    if not results:
        return {
            "answer": "No relevant information found in the knowledge base.",
            "sources": []
        }

    context = "\n\n".join(
        result["text"] for result in results
    )

    prompt = f"""
Answer the question using only the provided context.
If the answer is not in the context, say the information is not available.

Context:
{context}

Question:
{question}
"""

    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "question": question,
        "answer": response["message"]["content"],
        "sources": list({
            result["filename"] for result in results
        })
    }


if __name__ == "__main__":
    question = input("Enter your question: ")
    print(ask_question(question))