'use strict';

const Service = require('../services/Explorer');

module.exports = {
  index: async (ctx) => {
    ctx.send({
      message: 'ok'
    });
  },
  getElements: async (ctx) => {
    let m = await strapi.services.element.fetchAll({parent: []});
    ctx.send(m);
  }
};
