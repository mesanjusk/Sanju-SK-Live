import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_VIDEO_BYTES,isSupportedVideo} from '../utils/videoUploadValidation.js';
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
