// src/lib/commandParser.ts

export interface ParsedCommand {
  type:
    | 'reminder'
    | 'weather'
    | 'send_message'
    | 'open_url'
    | 'greeting'
    | 'farewell'
    | 'get_time'
    | 'get_date'
    | 'open_youtube'
    | 'play_song_youtube'
    | 'search_youtube'
    | 'browser_search'
    | 'open_gmail'
    | 'open_google'
    | 'open_chatgpt'
    | 'open_brave'
    | 'generate_image'
    | 'open_instagram'
    | 'open_snapchat'
    | 'open_email'
    | 'unknown';
  payload?: any;
  originalCommand: string;
}

const reminderRegex = /set(?: an?| the)? reminder(?: to)?\s+(.+?)(?:\s+(?:at|in|for)\s+(.+))?$/i;
const weatherRegex = /what(?:'s| is) the weather(?: like)?(?: in (.+))?/i;
const messageRegex = /send (?:a )?message(?: to (.+?))?(?:[.\s]+(?:(?:saying|that says|content|body|text|say)\s+)?(.+))?$/i;
const openUrlRegex = /open (?:url |website )?(https?:\/\/[^\s]+)/i;
const openUrlSimpleRegex = /open ([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/i;
const greetingRegex = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)(?: trushna)?/i;
const farewellRegex = /^(bye|goodbye|see you|later|farewell)(?: trushna)?/i;
const timeRegex = /(?:what(?:'s|s| is)?(?: the)?|tell me the|current|wats the)\s*time(?: now)?/i;
const dateRegex = /(?:what(?:'s|s| is)? (?:the )?(?:current )?(date|day)|today(?:'s|s)?\s*date)/i;
const openYouTubeRegex = /^open\s+youtube(?:\\.)?$/i;
const playSongYouTubeRegex = /^(play|stream)\s+(?:song\s+)?(.+?)(?:\s+on\s+youtube)?$/i;
const searchYouTubeRegex = /^search\s+(.+?)\s+on\s+youtube$/i;
const browserSearchRegex = /^(search|find)(?:\s+(?:for|about))?\s+(.+?)(?:\s+on\s+(?:browser|google|web))?$/i;
const openGmailRegex = /^open\s+gmail(?:\\.)?$/i;
const openGoogleRegex = /^open\s+google(?:\\.)?$/i;
const openChatGptRegex = /^open\s+chatgpt(?:\\.)?$/i;
const openBraveRegex = /^open\s+brave(?:(?:\s+search)?\\.)?$/i;
const generateImageRegex = /^(generate|create|draw|make|build|imagine|visualize|img)\s+(?:an?\s+)?(?:image|picture|photo|drawing|illustration|img)\s*(?:(?:of|about|showing|depicting)\s+)?(.+)/i;
const openInstagramRegex = /^open\s+instagram(?:\\.)?$/i;
const openSnapchatRegex = /^open\s+snapchat(?:\\.)?$/i;
const openEmailRegex = /^open\s+(?:my\s+)?email(?:\s+(?:client|app))?(?:\\.)?$/i;


export function parseCommand(command: string): ParsedCommand {
  const lowerCommand = command.toLowerCase().trim().replace(/\s+/g, ' ');

  let match = lowerCommand.match(generateImageRegex);
  if (match) {
    return { type: 'generate_image', payload: { prompt: match[2].trim() }, originalCommand: command };
  }

  match = lowerCommand.match(reminderRegex);
  if (match) {
    return {
      type: 'reminder',
      payload: { task: match[1].trim(), timeRaw: match[2] ? match[2].trim() : 'later' },
      originalCommand: command,
    };
  }

  match = lowerCommand.match(weatherRegex);
  if (match) {
    return { type: 'weather', payload: { location: match[1] ? match[1].trim() : 'current location' }, originalCommand: command };
  }

  match = lowerCommand.match(messageRegex);
  if (match) {
    return {
      type: 'send_message',
      payload: {
        to: match[1] ? match[1].trim() : undefined,
        body: match[2] ? match[2].trim() : undefined
      },
      originalCommand: command
    };
  }

  match = lowerCommand.match(openYouTubeRegex);
  if (match) {
    return { type: 'open_youtube', originalCommand: command };
  }

  match = lowerCommand.match(playSongYouTubeRegex);
  if (match) {
    return { type: 'play_song_youtube', payload: { songName: match[2].trim() }, originalCommand: command };
  }

  match = lowerCommand.match(searchYouTubeRegex);
  if (match) {
    return { type: 'search_youtube', payload: { query: match[1].trim() }, originalCommand: command };
  }

  match = lowerCommand.match(browserSearchRegex);
  if (match) {
    return { type: 'browser_search', payload: { query: match[2].trim() }, originalCommand: command };
  }

  match = lowerCommand.match(openGmailRegex);
  if (match) {
    return { type: 'open_gmail', originalCommand: command };
  }

  match = lowerCommand.match(openGoogleRegex);
  if (match) {
    return { type: 'open_google', originalCommand: command };
  }

  match = lowerCommand.match(openChatGptRegex);
  if (match) {
    return { type: 'open_chatgpt', originalCommand: command };
  }

  match = lowerCommand.match(openBraveRegex);
  if (match) {
    return { type: 'open_brave', originalCommand: command };
  }

  match = lowerCommand.match(openInstagramRegex);
  if (match) {
    return { type: 'open_instagram', originalCommand: command };
  }

  match = lowerCommand.match(openSnapchatRegex);
  if (match) {
    return { type: 'open_snapchat', originalCommand: command };
  }

  match = lowerCommand.match(openEmailRegex);
  if (match) {
    return { type: 'open_email', originalCommand: command };
  }

  match = lowerCommand.match(openUrlRegex);
  if (match) {
    return { type: 'open_url', payload: { url: match[1] }, originalCommand: command };
  }

  match = lowerCommand.match(openUrlSimpleRegex);
  if (match) {
    let url = match[1];
    if (!url.includes('.') || url.split('.').length < 2 || url.endsWith('.')) {
        // Not a well-formed domain
    } else {
        return { type: 'open_url', payload: { url }, originalCommand: command };
    }
  }

  match = lowerCommand.match(greetingRegex);
  if (match) {
    return { type: 'greeting', originalCommand: command };
  }

  match = lowerCommand.match(farewellRegex);
  if (match) {
    return { type: 'farewell', originalCommand: command };
  }

  match = lowerCommand.match(timeRegex);
  if (match) {
    return { type: 'get_time', originalCommand: command };
  }

  match = lowerCommand.match(dateRegex);
  if (match) {
    return { type: 'get_date', originalCommand: command };
  }

  return { type: 'unknown', payload: { command: command }, originalCommand: command };
}
