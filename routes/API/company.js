// Global var and functions
const express = require('express');
const router = express.Router({
    mergeParams: true,
    strict: true
});
const bodyParser = require('body-parser');

const basic = require('./company/basic');

router.route('/:company_name?')
    /**
     *  @swagger
     * 
     *  /company/{company_name}:
     *      get:
     *          description: Returns the company information
     *          tags:
     *              - Company
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: company_name
     *                description: id of the company
     *                in: path
     *                requried: true
     *                type: string
     * 
     *          responses:
     *              200:
     *                  description: Successfully get the Company
     *              400:
     *                  description: Company could not be found
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .get(basic.getCompany)

    /**
     *  @swagger
     * 
     *  /company:
     *      post:
     *          description: Add a Company
     *          tags:
     *              - Company
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: name
     *                description: Name of the company
     *                in: formData
     *                requried: true
     *                type: string
  
     *          responses:
     *              200:
     *                  description: Successfully add the company
     *              400:
     *                  description: User could not be found
     *              500:
     *                  description: Internal server error
     * 
     */
    .post(basic.addCompany)

    /**
     *  @swagger
     * 
     *  /company/{company_id}:
     *      put:
     *          description: Update a company
     *          tags:
     *              - Company
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: company_id
     *                description: id of the company
     *                in: path
     *                requried: true
     *                type: string
     *              - name: company_name
     *                description: Name of the company
     *                in: formData
     *                requried: False
     *                type: string
     *              - name: successful_hires
     *                description: Number of successful hires
     *                in: formData
     *                requried: False
     *                type: integer
     *              - name: num_jobs
     *                description: Number of jobs available
     *                in: formData
     *                requried: False
     *                type: integer
     *              - name: num_employers
     *                description: Number of employers
     *                in: formData
     *                requried: False
     *                type: integer
     * 
     *          responses:
     *              200:
     *                  description: Successfully delete the company
     *              400:
     *                  description: User could not be found
     *              500:
     *                  description: Internal server error
     */
    .delete(basic.updateCompany)

    /**
     *  @swagger
     * 
     *  /company/{company_id}:
     *      delete:
     *          description: Delete a company
     *          tags:
     *              - Company
     *          produces: 
     *              - application/json
     *          parameters:
     *              - name: company_id
     *                description: id of the company
     *                in: path
     *                requried: true
     *                type: string
     * 
     *          responses:
     *              200:
     *                  description: Successfully delete the company
     *              400:
     *                  description: User could not be found
     *              500:
     *                  description: Internal server error
     * 
     * 
     */
    .delete(basic.deleteCompany)

module.exports = router;