import { path, knownFolders } from "tns-core-modules/file-system";
import { ios } from "tns-core-modules/utils/utils";


export class AudioPlayer {

  private completeCallback: () => void;
  private player: AVAudioPlayer | undefined;
  private task: NSURLSessionTask | undefined;

  constructor() {
  }

  get isPlaying(): boolean {
    return this.player ? this.player.playing : false;
  }

  initFromFile(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let fileName = file.trim();
        if (fileName.indexOf("~/") === 0) {
          fileName = path.join(
            knownFolders.currentApp().path,
            fileName.replace("~/", "")
          );
        }
        const audioSession = AVAudioSession.sharedInstance();
        const output = audioSession.currentRoute.outputs.lastObject.portType;

        if (output.match(/Receiver/)) {
          try {
            audioSession.setCategoryError(AVAudioSessionCategoryPlayAndRecord);
            audioSession.overrideOutputAudioPortError(AVAudioSessionPortOverride.Speaker);
            audioSession.setActiveError(true);
          } catch (error) {
            throw error;
          }
        }

        this.player = AVAudioPlayer.alloc().initWithContentsOfURLError(NSURL.fileURLWithPath(fileName));
        const delegate = new AudioPlayerDelegate();
        delegate.initWithAudioPlayer(this);
        this.player.delegate = delegate; // Adding this delegate causes the crash. Why?
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  initFromUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const sharedSession = ios.getter(NSURLSession, NSURLSession.sharedSession);
        this.task = sharedSession.dataTaskWithURLCompletionHandler(NSURL.URLWithString(url), (data, response, error) => {
          if (error !== null) {
            reject(new Error(error.localizedDescription));
          } else {
            const audioSession = AVAudioSession.sharedInstance();
            const output = audioSession.currentRoute.outputs.lastObject.portType;

            if (output.match(/Receiver/)) {
              try {
                audioSession.setCategoryError(
                  AVAudioSessionCategoryPlayAndRecord
                );
                audioSession.overrideOutputAudioPortError(
                  AVAudioSessionPortOverride.Speaker
                );
                audioSession.setActiveError(true);
              } catch (error) {
                throw error;
              }
            }

            this.player = AVAudioPlayer.alloc().initWithDataError(data);
            const delegate = new AudioPlayerDelegate();
            delegate.initWithAudioPlayer(this);
            this.player.delegate = delegate;
            resolve();
          }
        }
        );
        this.task.resume();
      } catch (error) {
        reject(error);
      }
    });
  }

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isPlaying && this.player) {
          this.player.play();
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}

export class AudioPlayerDelegate extends NSObject implements AVAudioPlayerDelegate {
  static ObjCProtocols = [AVAudioPlayerDelegate];

  private audioPlayer: AudioPlayer;

  initWithAudioPlayer(audioPlayer: AudioPlayer) {
    super.init();
    this.audioPlayer = audioPlayer;
  }

  audioPlayerDidFinishPlayingSuccessfully(player: AVAudioPlayer, flag: boolean): void {
    console.log("Never got called");
  }

}
