import asyncio
from rag_engine import query_rag

async def test_hybrid_rag():
    print("--- Test 1: Greeting (General Mode) ---")
    response1 = await query_rag("Hello, how are you?")
    print(f"Query: Hello, how are you?")
    print(f"Answer: {response1['answer']}")
    print(f"Sources: {response1['sources']}")
    print("\n")

    print("--- Test 2: Specific Query (RAG Mode - assuming docs exist or fallback) ---")
    # Note: If no docs are uploaded, this might also fall back to general mode if score is low,
    # but the prompt will handle it.
    response2 = await query_rag("What is the fee structure?")
    print(f"Query: What is the fee structure?")
    print(f"Answer: {response2['answer']}")
    print(f"Sources: {response2['sources']}")

if __name__ == "__main__":
    asyncio.run(test_hybrid_rag())
