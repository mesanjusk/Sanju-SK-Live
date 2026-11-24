import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_VIDEO_BYTES,isSupportedVideo,isSafeVideoLink} from '../utils/videoUploadValidation.js';
test('video file types are validated by MIME AND extension',()=>{
 assert.equal(isSupportedVideo({mimetype:'video/mp4',originalname:'wedding-reel.mp4'}),true);
 assert.equal(isSupportedVideo({mimetype:'video/webm',originalname:'design.webm'}),true);
 assert.equal(isSupportedVideo({mimetype:'image/png',originalname:'fake.mp4'}),false);
 assert.equal(isSupportedVideo({mimetype:'video/mp4',originalname:'fake.exe'}),false);
 assert.equal(isSupportedVideo({mimetype:'video/quicktime',originalname:'clip.mov'}),false);
 assert.equal(isSupportedVideo({mimetype:'video/mp4',originalname:'clip.mp4.exe'}),false);
 assert.equal(isSupportedVideo({mimetype:'video/mp4'}),false);
 assert.equal(MAX_VIDEO_BYTES,50*1024*1024);
});

test('social video links require trusted HTTPS providers',()=>{
 assert.ok(isSafeVideoLink('https://www.youtube.com/shorts/abcdefghijk','youtube'));
 assert.ok(isSafeVideoLink('https://youtu.be/abcdefghijk','youtube'));
 assert.ok(isSafeVideoLink('https://www.instagram.com/reel/Cx123Ab/','instagram'));
 assert.equal(isSafeVideoLink('javascript:alert(1)','instagram'),false);
 assert.equal(isSafeVideoLink('https://instagram.com.evil.example/reel/abc','instagram'),false);
 assert.equal(isSafeVideoLink('http://www.youtube.com/watch?v=abc','youtube'),false);
 assert.equal(isSafeVideoLink('https://evil.example/youtube/abc','youtube'),false);
});
