import { Component, OnInit } from "@angular/core";

import { Item } from "./item";
import { ItemService } from "./item.service";
import { AudioPlayer } from "~/app/item/audio-player";
import { path, knownFolders, File } from "tns-core-modules/file-system";
@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html"
})
export class ItemsComponent implements OnInit {
    items: Array<Item>;
    private path;
    private audioPlayer;
    // This pattern makes use of Angular’s dependency injection implementation to
    // inject an instance of the ItemService service into this class.
    // Angular knows about this service because it is included in your app’s main NgModule,
    // defined in app.module.ts.
    constructor(private itemService: ItemService) { }

    ngOnInit(): void {
        this.items = this.itemService.getItems();
        this.test();
    }
    play() {
        console.log("PLAY Audio and then expect it to crash once its done playing (Around 3 seconds after done)");
        this.audioPlayer.play();
    }
    test() {
        this.audioPlayer = new AudioPlayer();
        this.audioPlayer.initFromFile("~/sound/k.wav")
        .then(val => {
            console.log("YIPPE ");
        }).catch(err => {console.log("ERRRR " + err); })

        // Will crash as well
        // const ap: AudioPlayer = new AudioPlayer();
        // ap.initFromUrl("some-url-to-file")
        // .then(val => {
        //     console.log("YIPPE " + val);
        //     ap.play();
        // }).catch(err => {console.log("ERRRR " + err); })
    }
}
