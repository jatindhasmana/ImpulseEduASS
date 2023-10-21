const express = require("express");
const app = express();
const axios = require('axios');
const dash = require('lodash');
const memoize = require('lodash/memoize');

app.get("/",(req,res)=>{
    res.send("HI! I am root");
});

app.get('/api/blog-stats', memoize( async (req, res) => {

    // DATA Retrieval
    try {
      const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      });

    // DATA Analysis
      const blogData = response.data.blogs;
      console.log('Total number of blogs fetched:' , blogData.length);

      const LongestTitle = dash.maxBy(blogData,"title.length");
      console.log('Blog with the longest title:' , LongestTitle );

      const blogsWithPrivacyTitle = dash.filter(blogData, (blog) => dash.includes(blog.title.toLowerCase(), 'privacy'));
      console.log('Number of blogs with titles containing the word "privacy":', blogsWithPrivacyTitle.length);

      const uniqueTitles = dash.uniqBy(blogData, 'title');
      console.log('Array of unique blog titles:' , uniqueTitles);

      // Response

      const output = {
        totalBlogs : blogData.length,
        LongestTitle : LongestTitle.title,
        blogsWithPrivacyTitle : blogsWithPrivacyTitle.length,
        uniqueTitles : uniqueTitles.map(blog => blog.title)
      };
      res.json(output);

    } catch (error) {
      // Handle any errors that occurred during the request
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching blog data' });
    }
  }));

  //Blog Search Endpoint

  app.get('/api/blog-search', async(req,res)=>{
    try{
        const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
    });
    const blogData = response.data.blogs;

    let query = req.query.query;
    //console.log(query.toLowerCase());
    const requiredBlogs = dash.filter(blogData, blog => dash.includes(blog.title.toLowerCase(), query.toLowerCase()));
    const matchingBlogTitles = requiredBlogs.map(blog => blog);
    res.json(matchingBlogTitles);
    } catch(error){
        console.log(error);
        res.send("Failed to search required item!!")
    }
  });

  // Caching implementation
  const searchBlogs = memoize((query) => {
   
    const filteredBlogs = dash.filter(blogData, blog => blog.title.toLowerCase().includes(query.toLowerCase()));
    return filteredBlogs;
  });
  
  app.get('/api/blog-search', async (req, res) => {
    const query = req.query.query;
  
    try {
      const filteredBlogs = await searchBlogs(query);
      res.json(filteredBlogs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search blogs' });
    }
  });

app.listen("3000",()=>{
    console.log("Server is listening to port 3000");
})