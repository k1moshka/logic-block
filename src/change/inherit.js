import { extend } from './extend'
import { withHandler } from './withHandler'
import composeHandlers from '../composeHandlers'
import { isHandler, type BlockHandler } from '../handler'
import { isBlock, type BlockFactory } from '../block'

type BlockArgument = BlockFactory | Object

export const inherit = (parentBlock: BlockArgument, extendingBlock: BlockArgument, extraHandler?: BlockHandler) => {
  if (!parentBlock || (!isBlock(parentBlock) && typeof parentBlock !== 'object')) {
    throw new TypeError('Trying to inherit block with invalid parentBlock parameter. It should be BlockFactory or Scheme Object')
  }
  if (!extendingBlock || (!isBlock(extendingBlock) && typeof extendingBlock !== 'object')) {
    throw new TypeError('Trying to inherit block with invalid extendingBlock parameter. It should be BlockFactory or Scheme Object')
  }
  if (Boolean(extraHandler) && !isHandler(extraHandler)) {
    throw new TypeError('Trying to inherit block with invalid extraHandler parameter. It should be BlockHandler')
  }

  const parentHandler = isBlock(parentBlock)
    ? parentBlock.__getHandler()
    : undefined

  let handler
  if (isHandler(parentHandler)) {
    handler = extraHandler
      ? composeHandlers(
        parentHandler,
        extraHandler
      )
      : parentHandler
  } else if (extraHandler) {
    handler = extraHandler
  }

  return withHandler(
    extend(
      parentBlock,
      extendingBlock
    ),
    handler
  )
}
