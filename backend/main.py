from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import time
# LLM section import
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# IMPORTS FOR TEXT GENERATION PIPELINE CHAIN
from langchain.llms import HuggingFacePipeline
from langchain import PromptTemplate, LLMChain
import copy


app = FastAPI(
    title="Inference API for LLM",
    description="A simple API that use LLM as a chatbot",
    version="1.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # The frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)




### INITIALIZING LAMINI MODEL
checkpoint = "model/llamini"
# # Load model directly
# from transformers import AutoTokenizer, AutoModelForCausalLM

# tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3-mini-4k-instruct", trust_remote_code=True)
# base_model = AutoModelForCausalLM.from_pretrained("microsoft/Phi-3-mini-4k-instruct", device_map='auto')

tokenizer = AutoTokenizer.from_pretrained(checkpoint)
base_model = AutoModelForSeq2SeqLM.from_pretrained(checkpoint,
                                                    device_map='auto',
                                                    torch_dtype=torch.float32)
### INITIALIZING PIPELINE WITH LANGCHAIN
llm = HuggingFacePipeline.from_model_id(model_id=checkpoint,
                                        task = 'text2text-generation',
                                        model_kwargs={"temperature":0,"min_length":30, "max_length":350, "repetition_penalty": 5.0})
template = """You are the AI assisant : {text}"""
prompt = PromptTemplate(template=template, input_variables=["text"])
llm_chain = LLMChain(prompt=prompt, llm=llm)
# Mock chatbot response
async def get_chatbot_response(message):
    # Simulate a streaming response
    response_text = f"You said: {message}"
    async def streaming_response():
        for char in response_text:
            yield char
            time.sleep(0.1)  # Simulate processing time
    return streaming_response()

@app.post("/chat", status_code=200)
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")
    res = llm_chain.run(message)
    # response = await get_chatbot_response(res)
    return StreamingResponse(res, media_type="text/event-stream")



@app.get('/model')
async def model():
    res = llm_chain.run("Who is Ada Lovelace?")
    result = copy.deepcopy(res)
    return {"result" : result}
