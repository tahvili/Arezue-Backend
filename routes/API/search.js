var express = require('express');
var router = express.Router({
    mergeParams: true,
    strict: true
});
const bodyParser = require('body-parser');

const search = require("./search/search");

router.route('/candidates')
    /**
     *  @swagger
     * 
     *  /search/candidates:
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

router.route('/skill')
    /**
     *  @swagger
     * 
     *  /search/skill?q={q}&?limit={limit}:
     *      get:
     *          description: Search the predefiled skills table based on query
     *          tags:
     *              - Search
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: q
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: string
     *              - name: limit
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: integer
     * 
     *          responses:
     *              200:
     *                  description: Successfully returned all matching string
     *              400:
     *                  description: Field incorrect
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .get(search.searchSkill)

    router.route('/career')
    /**
     *  @swagger
     * 
     *  /search/career?q={q}&?limit={limit}:
     *      get:
     *          description: Search the predefiled careers table based on query
     *          tags:
     *              - Search
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: q
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: string
     *              - name: limit
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: integer
     * 
     *          responses:
     *              200:
     *                  description: Successfully returned all matching string
     *              400:
     *                  description: Field incorrect
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .get(search.searchCareer)

    router.route('/company')
    /**
     *  @swagger
     * 
     *  /search/company?q={q}&?limit={limit}:
     *      get:
     *          description: Search the predefiled companies table based on query
     *          tags:
     *              - Search
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: q
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: string
     *              - name: limit
     *                description: The requested query
     *                in: query
     *                requried: true
     *                type: integer
     * 
     *          responses:
     *              200:
     *                  description: Successfully returned all matching string
     *              400:
     *                  description: Field incorrect
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .get(search.searchCompany)

    module.exports = router;