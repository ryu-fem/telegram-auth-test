export async function readJsonBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<unknown | undefined> {
  if (!request.body) {
    return undefined
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      totalBytes += value.byteLength

      if (totalBytes > maxBytes) {
        await reader.cancel()
        return undefined
      }

      chunks.push(value)
    }

    const body = new Uint8Array(totalBytes)
    let offset = 0

    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }

    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body))
  } catch {
    return undefined
  } finally {
    reader.releaseLock()
  }
}
