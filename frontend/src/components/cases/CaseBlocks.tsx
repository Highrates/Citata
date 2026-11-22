import Image from 'next/image'
import type { CaseBlock } from '@/content/types'

export function CaseBlocks({ blocks }: { blocks: CaseBlock[] }) {
  return (
    <div className="case-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const Tag = block.level
            return (
              <Tag key={index} className="case-content__heading">
                {block.text}
              </Tag>
            )
          }
          case 'paragraph':
            return (
              <p key={index} className="case-content__paragraph">
                {block.text}
              </p>
            )
          case 'quote':
            return (
              <blockquote key={index} className="case-content__quote">
                <p>{block.text}</p>
                {block.author ? <cite>— {block.author}</cite> : null}
              </blockquote>
            )
          case 'image':
            return (
              <figure key={index} className="case-content__figure">
                <div className="case-content__figure-media">
                  <Image src={block.src} alt={block.alt} fill className="case-content__image" />
                </div>
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            )
          case 'metrics':
            return (
              <section key={index} className="case-content__metrics">
                {block.title ? (
                  <h3 className="case-content__heading">{block.title}</h3>
                ) : null}
                <ul>
                  {block.items.map((item) => (
                    <li key={item.label}>
                      <span className="case-content__metric-value">{item.value}</span>
                      <span className="case-content__metric-label">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          case 'list':
            return (
              <section key={index} className="case-content__list-block">
                {block.title ? (
                  <h3 className="case-content__heading">{block.title}</h3>
                ) : null}
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
