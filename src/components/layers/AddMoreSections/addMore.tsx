import Links from "./Links/links.tsx";
import Videos from "./Video/video.tsx";
import Musics from "./Music-Posdcast/music_podcast.tsx";
import Post from "./Socialpost/social_post.tsx";
import WhatsApp from "./WhattsApp/whatsapp.tsx";
// import AppD from "./App/whatsapp.tsx";
//import Downloads from "./Download/download.tsx";


const Add = () => {
    return (
        <>

            <div className="mb-6 mt-10">
                <h3 className="text-gray-600 text-lg font-medium mb-8">Add more sections</h3>

                {/* SELL Section */}
                <div className="mb-6">
                    {/*}
                    <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">SELL</h4>


                    <Downloads/>*/}
                    <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">CONTENT</h4>
                    {/*
                    <AppD/>
                    */}
                    <WhatsApp/>
                    <Links/>
                    <Videos/>
                    <Musics/>
                    <Post/>
                </div>
            </div>
        </>
    );
}

export default Add;
