import express, { Application } from 'express';

export default (app: Application) => {
  app.use(express.json());
  app.use(express.text());
  app.use(express.raw());
  app.use(express.urlencoded());
};
