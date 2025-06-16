import { AwsS3Provider } from "./aws-s3.provider"
import { MediaProvider } from "./media.provider"
// TODO: implement localfs provider and update the factory
class MediaProviderFactory {
  private _provider: MediaProvider
  constructor() {
    this._provider = new AwsS3Provider()
  }
  get provider() {
    return this._provider
  }
}

export default new MediaProviderFactory()