type VizierContentRequestMessage = { type: '@nodm/vizier/content-request' };
type VizierContentResponseMessage = {
  type: '@nodm/vizier/content-response';
  data: { title: string; content: string };
};

type VizierMessage = VizierContentRequestMessage | VizierContentResponseMessage;

export const isVizierMessage = (message: unknown): message is VizierMessage => {
  return (message as VizierMessage).type?.startsWith('@nodm/vizier/') ?? false;
};

export const isVizierContentRequestMessage = (
  message: unknown
): message is VizierContentRequestMessage => {
  return (message as VizierMessage).type === '@nodm/vizier/content-request';
};

export const isVizierContentResponseMessage = (
  message: unknown
): message is VizierContentResponseMessage => {
  return (message as VizierMessage).type === '@nodm/vizier/content-response';
};
