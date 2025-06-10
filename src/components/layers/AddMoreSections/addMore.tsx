import {Download} from "lucide-react";
import Links from "./Links/links.tsx";
import TextBox from "./TextBox/textBox.tsx";
import Linked from "./LinkedTiktokFeed/linkedTiktok.tsx";
import Videos from "./Video/video.tsx";
import Musics from "./Music-Posdcast/music_podcast.tsx";
import Post from "./Socialpost/social_post.tsx";


const Add =() =>{
    return (
        <>

        <div className="mb-6">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Add more sections</h3>

            {/* SELL Section */}
            <div className="mb-6">
                <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">SELL</h4>

                {/* Digital Download */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <Download size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="text-white font-medium">Digital Download</div>
                            <div className="text-gray-400 text-sm">Sell ebooks, audio files, PDFs and more</div>
                        </div>
                    </div>
                    <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                        <span className="text-white text-sm">+</span>
                    </div>
                </div>
                <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">CONTENT</h4>

                <Links/>
                <TextBox/>
                <Linked/>
                <Videos/>
                <Musics/>
                <Post/>
            </div>
        </div>
        </>
);
}

export default Add;