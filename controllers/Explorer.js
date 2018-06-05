'use strict';

module.exports = {
  index: async (ctx) => {
    ctx.send({
      message: 'ok'
    });
  },
  getElements: async (ctx) => {
    ctx.send(await strapi.services.element.fetchAll({parent: []}));
  },
  setElement: async (ctx) => {
    ctx.send(await strapi.services.element.edit({_id: ctx.request.body._id}, ctx.request.body));
  }
};
