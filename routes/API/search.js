var express = require('express');
var router = express.Router({
    mergeParams: true,
    strict: true
});
const bodyParser = require('body-parser');

const search = require("./search/search");

router.route('/')
    /**
     *  @swagger
     * 
     *  /search:
     *      post:
     *          description: Search for candidates by skill
     *          tags:
     *              - Employer
     *              - Search
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: skills
     *                description: Array of skills to query by
     *                in: formData
     *                requried: true
     *                type: array
     *                items: {}
     * 
     *          responses:
     *              200:
     *                  description: Successfully searches and returns resumes
     *              400:
     *                  description: Failed to search
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .post(search.searchCandidates);

    module.exports = router;