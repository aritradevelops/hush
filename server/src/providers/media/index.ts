import env from "../../lib/env"
import { AwsS3Provider } from "./aws-s3.provider"
import { LocalFsProvider } from "./local-fs.provider"
import { MediaProvider } from "./media.provider"
// TODO: implement localfs provider and update the factory
class MediaProviderFactory {
  private _provider: MediaProvider
  constructor() {
    let provider: MediaProvider
    switch (env.get('MEDIA_PROVIDER')) {
      case "aws": {
        provider = new AwsS3Provider()
        break
      }
      case "localfs": {
        provider = new LocalFsProvider()
      }
    }
    this._provider = provider
  }
  get provider() {
    return this._provider
  }
}

export default new MediaProviderFactory()