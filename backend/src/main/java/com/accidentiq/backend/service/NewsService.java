
package com.accidentiq.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NewsService {

    private static final String RSS_URL =
        "https://news.google.com/rss/search?q=" +
        "Chennai+road+accident+OR+road+safety&hl=en-IN&gl=IN&ceid=IN:en";

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    public List<Map<String, String>> getRoadSafetyNews() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(RSS_URL))
                .timeout(Duration.ofSeconds(15))
                .header("User-Agent", "AccidentIQ/1.0")
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                throw new IllegalStateException(
                    "News provider returned HTTP " + response.statusCode()
                );
            }

            DocumentBuilderFactory factory =
                DocumentBuilderFactory.newInstance();

            factory.setFeature(
                "http://apache.org/xml/features/disallow-doctype-decl",
                true
            );
            factory.setFeature(
                "http://xml.org/sax/features/external-general-entities",
                false
            );
            factory.setFeature(
                "http://xml.org/sax/features/external-parameter-entities",
                false
            );
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            factory.setExpandEntityReferences(false);

            Document document = factory.newDocumentBuilder().parse(
                new InputSource(new StringReader(response.body()))
            );

            NodeList items = document.getElementsByTagName("item");
            List<Map<String, String>> news = new ArrayList<>();

            for (int i = 0; i < items.getLength() && news.size() < 20; i++) {
                Element item = (Element) items.item(i);

                String title = getTagValue(item, "title");
                String link = getTagValue(item, "link");
                String publishedAt = getTagValue(item, "pubDate");
                String description = getTagValue(item, "description");
                String source = getTagValue(item, "source");

                if (title.isBlank() || link.isBlank()) {
                    continue;
                }

                Map<String, String> article = new LinkedHashMap<>();
                article.put("title", title);
                article.put("link", link);
                article.put("publishedAt", publishedAt);
                article.put("description", cleanDescription(description));
                article.put(
                    "source",
                    source.isBlank() ? "Google News" : source
                );

                news.add(article);
            }

            return news;

        } catch (Exception exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Unable to retrieve road safety news. Please try again later.",
                exception
            );
        }
    }

    private String getTagValue(Element element, String tagName) {
        NodeList nodes = element.getElementsByTagName(tagName);

        if (nodes.getLength() == 0 ||
            nodes.item(0).getTextContent() == null) {
            return "";
        }

        return nodes.item(0).getTextContent().trim();
    }

    private String cleanDescription(String description) {
        if (description == null || description.isBlank()) {
            return "Open the article to read the full report.";
        }

        return description
            .replaceAll("(?i)<br\\s*/?>", " ")
            .replaceAll("<[^>]*>", " ")
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&#39;", "'")
            .replaceAll("\\s+", " ")
            .trim();
    }
}
