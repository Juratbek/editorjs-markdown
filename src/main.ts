import {API, BlockTool, BlockToolData, OutputBlockData, ToolboxConfig} from '@editorjs/editorjs';
import { remark } from 'remark'
import {
  parseMarkdownToCode,
  parseMarkdownToDelimiter,
  parseMarkdownToHeader,
  parseMarkdownToList,
  parseMarkdownToParagraph, parseMarkdownToQuote
} from "./BlockTypeParsers";

interface MarkdownToolData extends BlockToolData {
  text: string;
}

const editorData: OutputBlockData[] = [];

class Markdown implements BlockTool {
  // @ts-ignore
  private api: API;
  // @ts-ignore
  private data: MarkdownToolData;
  static get toolbox(): ToolboxConfig {
    return {
      title: 'Markdown',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(112, 118, 132)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-fileUpload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    };
  }

  constructor({ data, api }: { data: MarkdownToolData; api: API }) {
    this.api = api;
    this.data = data;
  }

  render() {
    const input = document.createElement('input');
    input.setAttribute('id', 'file-upload');
    input.setAttribute('type', 'file');
    input.setAttribute('style', 'display: none');
    input.setAttribute('name', 'files[]');
    input.addEventListener("change", this.onMdLoad)
    input.click()
    return input;
  }

  onMdLoad = (e) => {
    editorData.length = 0
    const target = e.target as HTMLInputElement
    const file = target.files[0];

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = (readerEvent) => {
      const content = readerEvent.target.result as string;

      const parsedMarkdown = remark().parse(content);
      console.log(parsedMarkdown)
      // iterating over the pared remarkjs syntax tree and executing the json parsers
      parsedMarkdown.children.forEach((item, index) => {
        switch (item.type) {
          case 'heading':
            return editorData.push(<OutputBlockData<string, any>>parseMarkdownToHeader(item));
          case 'paragraph':
            return editorData.push(<OutputBlockData<string, any>>parseMarkdownToParagraph(item));
          case 'list':
            return editorData.push(<OutputBlockData<string, any>>parseMarkdownToList(item));
          case 'thematicBreak':
            return editorData.push(<OutputBlockData<string, any>>parseMarkdownToDelimiter());
          case 'code':
            return editorData.push(parseMarkdownToCode(item));
          case 'blockquote':
            return editorData.push(<OutputBlockData<string, any>>parseMarkdownToQuote(item));
          default:
            break;
        }
      });
      // clear the editor
      this.api.blocks.clear();
      // render the editor with imported markdown data
      this.api.blocks.render({
        blocks: editorData.filter((value) => Object.keys(value).length !== 0), // filter through array and remove empty objects
      });

      return remark().parse(content);
    };
  };

  save(blockContent: HTMLElement): MarkdownToolData {
    return {
      text: "Download Markdown",
    };
  }
}

export default Markdown;
