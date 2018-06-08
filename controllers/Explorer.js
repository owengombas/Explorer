'use strict';

function del(obj) {
  obj.forEach(o => {
    o.children.forEach(child => {
      strapi.services.element.remove({_id: child._id});
      if (child.children.length > 0) {
        del([child]);
      }
    });
    strapi.services.element.remove({_id: o._id});
  });
}

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
  },
  addElement: async (ctx) => {
    ctx.send(await strapi.services.element.add(ctx.request.body));
  },
  delElement: async (ctx) => {
    del(await strapi.services.element.fetchAll({parent: [ctx.request.body._id]}));
    ctx.send(await strapi.services.element.remove({_id: ctx.request.body._id}));
  }
};
