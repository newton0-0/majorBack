require('dotenv').config();

const mimetype = require('mimetype');

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { uploadToS3WithHash } = require('./uploadToAws');

const ownAI = async (req, res) => {
    if (!req.files || !req.files['image']) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing image file.' 
        });
    }
    try {
        const image = req.files['image'][0];
        const imageFileName = image.originalname;
        console.log(imageFileName);
        const imageUrl = await uploadToS3WithHash(image, imageFileName);
        console.log('imageUrl', imageUrl);
        const fetchModelRes = await axios.get(`${process.env.PREDICTION_URL}/prediction?imgPath=${imageUrl}`).
        then((result) => {
            console.log('result', result.data);
            return result.data
        }).catch((error) => {
            console.log(error);
        });
        res.status(200).json(fetchModelRes);
    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const expertAI = async (req, res) => {
    try {
        if (!req.files || !req.files['image']) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing image file.' 
            });
        }
        const prompt = "Analyze the provided image of a railway track for any potential defects.  If defects are found, describe the defect type (e.g., crack, misalignment, wear) and severity (minor, major, critical). Additionally, suggest potential causes of the defect and outline specific measures a technician should take for testing, precautions to prevent further damage, and rectification methods";
        const images = req.files['image']; // Access uploaded image(s)

        const gemini_api_key = process.env.API_KEY;
        const googleAI = new GoogleGenerativeAI(gemini_api_key);
        const model = googleAI.getGenerativeModel({ model: "gemini-pro-vision" });

        for (const image of images) {
            console.log(image.originalname);
            const imageFile = Buffer.from(image.buffer, 'base64'); // Access uploaded image details

            // Determine MIME type based on file extension
            const mimeType = image.mimetype || 'application/octet-stream'; // Default to 'application/octet-stream' if MIME type cannot be determined

            // Prepare image data for Gemini API (adjust based on API requirements)
            const imageData = {
                inlineData: {
                    data: imageFile.toString('base64'), // Convert the buffer to base64 string
                    mimeType, // Use MIME type from the uploaded file
                },
            };
            console.log(imageData);

            // Process the image using the Google Generative AI API
            const result = await model.generateContent([prompt, imageData]);
            // You may want to accumulate results for each image here if needed
            return res.json({ 
                sucess : true,
                data: result.response.candidates[0].content.parts[0].text
             });
        }

        // Once all images are processed, send the response
        res.status(200).json({ 
            sucess : false, 
            text: "I am sorry, seems this service is not available"
        });

    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const verifyAI = async (req, res) => {
    try {
        if (!req.files || !req.files['image']) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing image file.' 
            });
        }
        const sentence = req.body.sentence;
        
        const prompt = `Analyze the provided image of a railway track with high accuracy. Is the statement ${sentence} accurate?  Provide a confidence score (percentage) for your assessment.  If any potential defects are found, describe the defect type (e.g., crack, misalignment, wear) and severity (minor, major, critical). Additionally, suggest potential causes of the defect and outline specific measures a technician should take for testing to confirm the defect, precautions to prevent further damage, and rectification methods.`;
        const images = req.files['image']; // Access uploaded image(s)

        const gemini_api_key = process.env.API_KEY;
        const googleAI = new GoogleGenerativeAI(gemini_api_key);
        const model = googleAI.getGenerativeModel({ model: "gemini-pro-vision" });

        for (const image of images) {
            console.log(image.originalname);
            const imageFile = Buffer.from(image.buffer, 'base64'); // Access uploaded image details

            // Determine MIME type based on file extension
            const mimeType = image.mimetype || 'application/octet-stream'; // Default to 'application/octet-stream' if MIME type cannot be determined

            // Prepare image data for Gemini API (adjust based on API requirements)
            const imageData = {
                inlineData: {
                    data: imageFile.toString('base64'), // Convert the buffer to base64 string
                    mimeType, // Use MIME type from the uploaded file
                },
            };
            console.log(imageData);

            // Process the image using the Google Generative AI API
            const result = await model.generateContent([prompt, imageData]);
            // You may want to accumulate results for each image here if needed
            return res.json({ 
                sucess : true,
                data: result.response.candidates[0].content.parts[0].text
             });
        }

        // Once all images are processed, send the response
        res.status(200).json({ 
            sucess : false, 
            data: "I am sorry, seems this service is not available"
        });

    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    ownAI,
    verifyAI,
    expertAI
};
