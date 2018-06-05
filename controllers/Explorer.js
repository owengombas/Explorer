'use strict';

module.exports = {
  index: async (ctx) => {
    ctx.send({
      message: 'ok'
    });
  },
  getElements: async (ctx) => {
    let m = await strapi.services.element.fetchAll({parent: []});
    ctx.send(m);
  },
  setElement: async (ctx) => {
    console.log(ctx.request.body);
    let x = await strapi.services.element.edit({_id: ctx.request.body._id}, ctx.request.body);
    console.log(x);
    ctx.send(x);
  }
};
