import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# --- Load once at startup ---
# Load embedding model once


# local_model_path = f"models--sentence-transformers--all-MiniLM-L6-v2"

# embeddings = HuggingFaceEmbeddings(model_name=local_model_path)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


# embeddings = HuggingFaceEmbeddings(
#     model_name="C:/Users/sjasm/Documents/capital_one/Application/KisanAI/crop_management_tools/crop_cultivation_guide/embedding_model"
# )

# Get the directory where THIS file is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"BASE_DIR: {BASE_DIR}")

# Absolute path to Chroma DB folder
persist_directory = os.path.join(BASE_DIR, "chroma_langchain_db")

# Load existing Chroma vector store
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory=persist_directory  # persistent location
)

# --- Tool function ---


def retrieve_crop_cultivation_info(query: str, k: int = 3, score_threshold: float = 0.80) -> dict:
    """
    Search the Chroma vector store for documents about crop cultivation.
    Falls back if scores are too low.
    """
    print("RETRIEVE TOOL CALLED!")
    results = vector_store.similarity_search_with_score(query, k=k)

    docs = []
    for doc, score in results:
        # Keep only relevant docs
        if score >= score_threshold:
            docs.append({
                "title": doc.metadata.get("title", "Untitled"),
                "source": doc.metadata.get("source", "Unknown"),
                "content": doc.page_content
            })

    return {"context": docs}

# def retrieve_crop_cultivation_info(query: str) -> dict:
#     """
#     Search the persistent Chroma vector store for documents about crop cultivation.

#     Args:
#         query (str): Search string.

#     Returns:
#         dict: {
#             "context": [
#                 {
#                     "title": str,
#                     "source": str,
#                     "content": str
#                 },
#                 ...
#             ]
#         }
#     """
#     print("RETRIEVE TOOL CALLED!")
#     results = vector_store.similarity_search(query, k=3)
#     # print(f" Result: {results}")
#     # print("change")
#     docs = []
#     for doc in results:
#         docs.append({
#             "title": doc.metadata.get("title", "Untitled"),
#             "source": doc.metadata.get("source", "Unknown"),
#             "content": doc.page_content
#         })
#     return {"context": docs}


# if __name__ == "__main__":
#     # Example usage
#     result = retrieve_crop_cultivation_info("wheat cultivation steps")
#     print(result)
