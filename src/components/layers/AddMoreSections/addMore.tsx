import Links from "./Links/links.tsx";
import Videos from "./Video/video.tsx";
import Musics from "./Music-Posdcast/music_podcast.tsx";
import Post from "./Socialpost/social_post.tsx";
import WhatsApp from "./WhattsApp/whatsapp.tsx";
import AppD from "./App/app.tsx";


const Add = () => {
    return (
        <>

            <div className="mb-6 mt-10">


                {/* SELL Section */}
                <div className="mb-6">
                    {/*}
                    <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">SELL</h4>


                    <Downloads/>*/}
                    <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">CONTENIDO</h4>
                    <Links/>
                    <WhatsApp/>
                    <Videos/>
                    <AppD/>
                    <Musics/>
                    <Post/>
                </div>
            </div>
        </>
    );
}

export default Add;
