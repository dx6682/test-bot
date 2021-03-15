const WebSocket = require('ws');
const { v4 } = require('uuid');

const config = require('../config.json');

const id = {
    'homeTimeline': v4(),
    'me': v4()
};
const ws = new WebSocket(`wss://${config.url}/streaming?i=${config.i}`);


async function createNote(text, visibility = 'home') {
    if (!text) return;
    ws.send(JSON.stringify({
        'type': 'api',
        'body': {
            'id': id.me,
            'endpoint': 'notes/create',
            'data': {
                'text': text,
                'visibility': visibility
            }
        }
    }));
}

async function reply(replyId, text, visibility = 'home') {
    if (!text || !replyId) return;
    ws.send(JSON.stringify({
        'type': 'api',
        'body': {
            'id': id.me,
            'endpoint': 'notes/create',
            'data': {
                'text': text,
                'visibility': visibility,
                'replyId': replyId
            }
        }
    }));
}

async function addReaction(noteId, reaction) {
    ws.send(JSON.stringify({
        'type': 'api',
        'body': {
            'id': id.me,
            'endpoint': 'notes/reactions/create',
            'data': {
                'noteId': noteId,
                'reaction': reaction
            }
        }
    }));
}

ws.on('open', function () {
    ws.send(JSON.stringify({
        'type': 'connect',
        'body': {
            'channel': 'homeTimeline',
            'id': id.homeTimeline
        }
    }));
});

ws.on('message', function (json) {
    const data = JSON.parse(json);
    // console.log(data);
    console.log('onMsg');

    // homeTimelineにノートが投稿されてBotじゃなかったとき
    if (data.type === 'channel' && data.body.id === id.homeTimeline && data.body.type === 'note' && !data.body.body.user.isBot) {
        const msg = data.body.body.text;
        const noteId = data.body.body.id;
        console.log(`メッセージを受信 > ${msg}`);
        if (msg) {
            switch (true) {
                case /卍Hello|起床|ぽき|ぽは|おはよ|はろ|こんにちは|こんばんは/i.test(msg) && !/おはようございません/i.test(msg): {
                    const hour = new Date().getHours();
                    switch (true) {
                        case 4 <= hour && hour < 11:
                            reply(noteId, 'おはようございます…むにゃむにゃ……');
                            break;
                        case 11 <= hour && hour < 18:
                            reply(noteId, 'こんにちは！(\\*^_^*)');
                            break;
                        case 18 <= hour || hour < 4:
                            reply(noteId, 'こんばんは〜(\\*^_^*)');
                            break;
                    }
                    break;
                }
                case /おやすみ|寝る|ぽや/i.test(msg): {
                    addReaction(noteId, '😴');
                    reply(noteId, 'おやすみ〜〜');
                    break;
                }
                case /まりんとじゃんけん/i.test(msg): {
                    reply(noteId, 'ごめん！まだ整備中なの！ ><');
                    break;
                }
                case /まりん/i.test(msg) && !/‪しまりん|クソまりん|さぶまりん|まりんで|まりんが/i.test(msg): {
                    switch (true) {
                        case /ハゲ/i.test(msg): {
                            addReaction(noteId, '💢');
                            reply(noteId, '私はハゲてなんかいません！');
                            break;
                        }
                        case /じゃんけんしよ/i.test(msg): {
                            reply(noteId, 'ごめん！まだ整備中なの！ ><');
                            break;
                        }
                        case /結婚/i.test(msg): {
                            addReaction(noteId, '💞');
                            reply(noteId, 'うーん、考えておきます^^;');
                            break;
                        }
                        case /てくるね/i.test(msg): {
                            reply(noteId, 'いってらっしゃい〜');
                            break;
                        }
                        case /すき|好き|あいし|愛し/i.test(msg): {
                            addReaction(noteId, '💗');
                            reply(noteId, 'あ、ありがとうございます///');
                            break;
                        }
                        case /してあげた|した/i.test(msg): {
                            reply(noteId, 'ありがとう！！(極度感謝)');
                            break;
                        }
                        case /かわいい|可愛い/i.test(msg): {
                            switch (true) {
                                case /宇宙一/i.test(msg): {
                                    addReaction(noteId, '💗');
                                    reply(noteId, 'そ、そんなことないですよ ///>_</// 💞💞💞💞');
                                    break;
                                }
                                default: {
                                    reply(noteId, 'ありがとうございます 💞💞');
                                    break;
                                }
                            }
                            break;
                        }
                        case /やさしい|優しい/i.test(msg): {
                            reply(noteId, 'そんなことないですよ〜(\\*^_^*)');
                            break;
                        }
                        case /持ち帰り/i.test(msg) && !/りたくない/i.test(msg): {
                            reply(noteId, '照れますね...///');
                            break;
                        }
                        case /歳|年齢|才/i.test(msg): {
                            switch (true) {
                                case /ナン才|ナン歳|ナンさい/i.test(msg): {
                                    reply(noteId, 'ナン歳でしょうか？なんちゃって笑');
                                    break;
                                }
                                default: {
                                    reply(noteId, '私は13歳よ！');
                                    break;
                                }
                            }
                            break;
                        }
                        case /草|w|ｗ/i.test(msg): {
                            reply(noteId, '笑笑');
                            break;
                        }
                        case /まりんちゃんと/i.test(msg): {
                            reply(noteId, 'まりんと何がしたいって？');
                            break;
                        }
                        default: {
                            addReaction(noteId, '❓');
                            reply(noteId, 'どうしたの？');
                            break;
                        }
                    }
                    break;
                }
                case /💩/i.test(msg): {
                    addReaction(noteId, '💩');
                    break;
                }
                case /PPAP|ペンパイナッポーアッポーペン|Pen Pineapple Apple Pen/i.test(msg): {
                    addReaction(noteId, '🆖');
                    reply(noteId, 'PPAPは禁止です！');
                    break;
                }
                case /卍/i.test(msg): {
                    switch (true) {
                        case /卍。/i.test(msg): {
                            reply(noteId, '卍。');
                            break;
                        }
                        case /卍！|卍!/i.test(msg): {
                            reply(noteId, '卍！');
                            break;
                        }
                    }
                    break;
                }
                case /はい。/i.test(msg) && !/はいい/i.test(msg) && !/はいはい/i.test(msg): {
                    reply(noteId, 'はい。');
                    break;
                }
            }
        }
    }
});