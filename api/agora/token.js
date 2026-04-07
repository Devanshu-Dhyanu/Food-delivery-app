import { getAgoraRtcTokenApi, getAgoraServerConfig } from '../_lib/agora.js';
import { readJsonBody, sendMethodNotAllowed } from '../_lib/cashfree.js';

const isValidChannelName = (value) =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(value);

const isValidUserAccount = (value) =>
  typeof value === 'string' && /^[a-zA-Z0-9-]{8,128}$/.test(value);

const resolvePublisherRole = (RtcRole) =>
  RtcRole?.PUBLISHER ?? RtcRole?.RolePublisher ?? RtcRole?.ROLE_PUBLISHER ?? 1;

const buildUserAccountToken = ({
  appCertificate,
  appId,
  channelName,
  expiresAt,
  userAccount,
}) => {
  const { RtcRole, RtcTokenBuilder } = getAgoraRtcTokenApi();

  if (!RtcTokenBuilder || !RtcRole) {
    throw new Error('Agora token builder package is unavailable on the server.');
  }

  const buildToken =
    RtcTokenBuilder.buildTokenWithUserAccount ||
    RtcTokenBuilder.buildTokenWithAccount;

  if (typeof buildToken !== 'function') {
    throw new Error('Agora token builder does not support user-account tokens.');
  }

  return buildToken.call(
    RtcTokenBuilder,
    appId,
    appCertificate,
    channelName,
    userAccount,
    resolvePublisherRole(RtcRole),
    expiresAt
  );
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, 'POST');
  }

  const body = await readJsonBody(req);
  const { channelName, userAccount } = body;
  const agoraConfig = getAgoraServerConfig();

  if (!agoraConfig.appId || !agoraConfig.appCertificate) {
    return res.status(500).json({
      error:
        'Agora voice calling is not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE in Vercel.',
    });
  }

  if (!isValidChannelName(channelName)) {
    return res.status(400).json({
      error: 'A valid channelName is required.',
    });
  }

  if (!isValidUserAccount(userAccount)) {
    return res.status(400).json({
      error: 'A valid userAccount is required.',
    });
  }

  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const token = buildUserAccountToken({
      appCertificate: agoraConfig.appCertificate,
      appId: agoraConfig.appId,
      channelName,
      expiresAt,
      userAccount,
    });

    return res.status(200).json({
      appId: agoraConfig.appId,
      expiresAt,
      token,
      uid: userAccount,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Agora token could not be generated right now.',
    });
  }
}
