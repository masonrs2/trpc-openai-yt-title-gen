import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import puppeteer from "puppeteer";
import { Browser } from "puppeteer";
import { Configuration } from "openai"
import { OpenAIApi } from "openai/dist/api";

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_SECRET_KEY
  })

const openai = new OpenAIApi(configuration)


export const youtubeTitleGenerator = createTRPCRouter({
  youtube: publicProcedure.input(z.object({
    topic: z.string(),
    alias: z.string()
  }))
  .mutation(async ({ input }) => {
  
    const browser: Browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const url = `https://www.youtube.com/${"@t3dotgg"}/videos`
    await page.goto(url)

    const videos = await page.evaluate( async (url) => {
      
      const videoObject = Array.from(document.querySelectorAll("div#contents.style-scope.ytd-rich-grid-row"))
      const data = videoObject.map((video: any) => ({
        title: video.querySelector("h3 a").getAttribute("title"),

      }))

      return data.slice(0,10)
    }, url, openai, configuration)

    const prompt = `The following is a list of youtube video titles. After reading the titles, you are given a topic to then write a similar title for. \n\TITLES: $${videos ? videos.map((video) => video.title)
      .join('\n')

    : []
    }
      
    \n\nSIMILAR TITLE FOR TOPIC "${input.topic.toUpperCase()}\n"`
  
    const res = await openai.createCompletion({
      "model": "text-davinci-003",
      "prompt": prompt,
      "max_tokens": 70,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stream": false,
      "logprobs": null,
      "stop": "\n"
    })

    console.log(res.data)
    console.log(prompt)

    await browser.close()

    return res.data.choices[0]?.text;
    
  })
});
