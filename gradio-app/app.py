import os
import gradio as gr
import boto3
import json
import base64
import io
import pandas as pd

bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-west-2'
)

image_files = [os.path.join("images", f) for f in os.listdir(
    "images") if os.path.isfile(os.path.join("images", f))]


def image_mod(image):
    byte_arr = io.BytesIO()
    image.save(byte_arr, format='JPEG')
    byte_arr = byte_arr.getvalue()
    image_b64_string = base64.b64encode(byte_arr).decode("utf-8")

    modelId = 'anthropic.claude-3-sonnet-20240229-v1:0'
    contentType = 'application/json'
    accept = 'application/json'

    prompt = '''
            Instructions:
            I'm a compliance bot, I evaluate images and provide results back as a pass or fail. 
            Do not offer any explination  Only respond in JSON with the following schema: 
            
            [
            Condition:
            Status:
            Reason:
            Confidence:
            ]

            For each one of the conditions below return the result as an individual object, each condition is seperated by a comma, 
            If the below condition is in the picture, return a failed result with the string of fail, 
            if the below condition is not in the image, return the value pass.  
            If the below condition is found, provide the reason in the Reason field.  
            If the below condition is found, provide a Confidence rating between 1 and 100, 
            100 being the most Confident and 1 being the least confident 
            
            Condition: skeletons, person with beard, cigarettes, gun pointed at viewer, sharks, sharks eating humans,
            adult themes and mature content, bones, gun pointing at user, alcohol
            '''

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_b64_string
                    }
                },
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }
    ]

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 50000,
        "messages": messages
    })

    response = bedrock.invoke_model(
        modelId=modelId,
        contentType=contentType,
        accept=accept,
        body=body
    )

    # Print response
    response_body = json.loads(response.get('body').read())
    response_text = response_body['content'][0]['text']
    data = json.loads(response_text)
    df = pd.DataFrame(data)
    html_table = df.to_html(index=False)

    return html_table


demo = gr.Interface(
    fn=image_mod,
    inputs=gr.Image(type="pil"),
    examples=image_files,
    outputs="html",
    title="Gen AI Movie Poster Moderator",
    description="Flag poster that are not in semantic compliance with custom policies using Gen AI.",
)

if ("GRADIO_USERNAME" in os.environ) and ("GRADIO_PASSWORD" in os.environ):
    demo.launch(server_name="0.0.0.0", server_port=80, auth=(
        os.environ['GRADIO_USERNAME'], os.environ['GRADIO_PASSWORD']))
else:
    demo.launch(server_name="0.0.0.0", server_port=80)
