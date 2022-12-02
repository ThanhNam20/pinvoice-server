const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, certificateService, emailService } = require('../services');
const { modelApiResponse } = require('../utils/common');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', user, 'Create user successfully'));
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.ACCEPTED).send(modelApiResponse('success', result, ''));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.ACCEPTED).send(modelApiResponse('success', user, ''));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  await certificateService.genClientCertificate(req.body, req.params.userId);
  // const attachments = [{ filename: p12NameFile, path: p12Path }];
  // await emailService.sendCertificateAndKeyForNewClient(user.email, p12Password, attachments);
  res.status(httpStatus.ACCEPTED).send(modelApiResponse('success', user, 'Update user info successfully'));
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.ACCEPTED).send({ result: 'Delete user successfully' });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
