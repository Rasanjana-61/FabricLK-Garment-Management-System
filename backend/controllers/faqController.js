const asyncHandler = require('express-async-handler');
const FAQ = require('../models/faq.model');


const getFaqs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find({});
    res.json(faqs);
});


const createFaq = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    if (!question || !answer) {
        res.status(400);
        throw new Error('Please provide a question and an answer');
    }
    const faq = new FAQ({ question, answer });
    const createdFaq = await faq.save();
    res.status(201).json(createdFaq);
});


const updateFaq = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    const faq = await FAQ.findById(req.params.id);

    if (faq) {
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        const updatedFaq = await faq.save();
        res.json(updatedFaq);
    } else {
        res.status(404);
        throw new Error('FAQ not found');
    }
});


const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  
  if (!faq) {
    res.status(404);
    throw new Error('FAQ not found');
  }

  await faq.deleteOne(); 
  res.json({ message: 'FAQ removed successfully' });
});


module.exports = { getFaqs, createFaq, updateFaq, deleteFaq };
