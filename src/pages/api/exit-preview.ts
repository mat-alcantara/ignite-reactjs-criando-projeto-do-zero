/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextApiResponse } from 'next';

export default async (_, res: NextApiResponse) => {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
};
