'use strict';

module.exports = {
    getElements: async () => {
        return await strapi.query('element', 'name').find({})
    }
};
