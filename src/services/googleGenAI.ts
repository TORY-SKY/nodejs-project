import { GoogleGenAI, Type } from "@google/genai";
import {createTask, deleteTask, updateTask} from "../controllers/tasksController"

const ai = new GoogleGenAI({});



// defining AI executable function
const AddTaskFunctionDeclaration = {
  name: 'add_task',
  description: 'add task with specified due_date, properties:{low, medium, high }.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'tile of tasks',
      },
      due_date: {
        type: Type.STRING,
        description: 'Due_date of the task (e.g., "2024-07-29")',
      },
    completed: {
        type: Type.BOOLEAN,
        description: 'this confirms whether the task is completed or not using boolean (true/false)',
      },
      
    },
    required: ['title', 'due_date', 'completed'],
  },
};
const functionDeclarations = [AddTaskFunctionDeclaration]


export async function main(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [
          {
            functionDeclarations: [AddTaskFunctionDeclaration],
          },
        ],
      },
    });

    // 4️⃣ Check if the AI wants to call your function
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
      console.log(functionCall);
    } else {
      console.log("No function call found in the response.");
      console.log(response.text);
    }
  } catch (error) {
    console.error("Error calling Gemini:", error);
  }
}

await main("hi");