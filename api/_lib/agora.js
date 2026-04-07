import AgoraTokenPackage from 'agora-token';

const normalizeEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

export const getAgoraServerConfig = () => ({
  appCertificate: normalizeEnvValue(process.env.AGORA_APP_CERTIFICATE),
  appId:
    normalizeEnvValue(process.env.AGORA_APP_ID) ||
    normalizeEnvValue(process.env.VITE_AGORA_APP_ID),
});

export const getAgoraRtcTokenApi = () => {
  const packageValue = AgoraTokenPackage || {};
  const candidate = packageValue.default || packageValue;

  return {
    RtcRole: candidate.RtcRole || packageValue.RtcRole,
    RtcTokenBuilder: candidate.RtcTokenBuilder || packageValue.RtcTokenBuilder,
  };
};
